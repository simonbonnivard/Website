const FAQ_DURATION_MS = 480;
const FAQ_EASING = "cubic-bezier(0.33, 1, 0.68, 1)";

function resetAnswerStyles(answer) {
  if (!answer) return;
  answer.style.height = "";
  answer.style.overflow = "";
  answer.style.transition = "";
}

function animateAnswerHeight(answer, fromHeight, toHeight, durationMs) {
  if (!answer || durationMs === 0) return Promise.resolve();

  return new Promise((resolve) => {
    answer.style.overflow = "hidden";
    answer.style.height = fromHeight;
    answer.offsetHeight;
    answer.style.transition = `height ${durationMs}ms ${FAQ_EASING}`;

    const expand = () => {
      answer.style.height = toHeight === "auto" ? `${answer.scrollHeight}px` : toHeight;
    };

    if (toHeight === "auto") {
      requestAnimationFrame(() => requestAnimationFrame(expand));
    } else {
      requestAnimationFrame(expand);
    }

    const onEnd = (event) => {
      if (event.target !== answer || event.propertyName !== "height") return;
      answer.removeEventListener("transitionend", onEnd);
      resolve();
    };

    answer.addEventListener("transitionend", onEnd);
  });
}

export function initFaqAccordion({ reducedMotion = false } = {}) {
  const detailsList = [...document.querySelectorAll(".faq__details")];
  if (!detailsList.length) return () => {};

  const durationMs = reducedMotion ? 0 : FAQ_DURATION_MS;
  let animating = false;

  const closeDetails = async (details) => {
    if (!details.open) return;

    const answer = details.querySelector(".faq__answer");
    if (!answer || durationMs === 0) {
      details.open = false;
      resetAnswerStyles(answer);
      return;
    }

    await animateAnswerHeight(answer, `${answer.scrollHeight}px`, "0px", durationMs);
    details.open = false;
    resetAnswerStyles(answer);
  };

  const openDetails = async (details) => {
    const answer = details.querySelector(".faq__answer");
    if (!answer) return;

    if (durationMs === 0) {
      details.open = true;
      return;
    }

    details.open = true;
    await animateAnswerHeight(answer, "0px", "auto", durationMs);
    resetAnswerStyles(answer);
  };

  const onSummaryClick = async (event) => {
    event.preventDefault();
    if (animating) return;

    const details = event.currentTarget.closest(".faq__details");
    if (!details) return;

    animating = true;

    try {
      if (details.open) {
        await closeDetails(details);
        return;
      }

      await Promise.all(
        detailsList
          .filter((item) => item !== details && item.open)
          .map((item) => closeDetails(item))
      );
      await openDetails(details);
    } finally {
      animating = false;
    }
  };

  const summaries = detailsList
    .map((details) => details.querySelector(".faq__summary"))
    .filter(Boolean);

  summaries.forEach((summary) => {
    summary.addEventListener("click", onSummaryClick);
  });

  return () => {
    summaries.forEach((summary) => {
      summary.removeEventListener("click", onSummaryClick);
    });
  };
}

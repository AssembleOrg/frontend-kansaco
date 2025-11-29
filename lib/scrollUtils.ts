export const scrollToSection = (
  sectionId: string,
  options: { offset?: number; behavior?: ScrollBehavior } = {}
) => {
  const { offset = 80, behavior = 'smooth' } = options;

  const section = document.getElementById(sectionId);
  if (!section) {
    console.warn(`Section with id "${sectionId}" not found`);
    return;
  }

  const targetPosition = section.getBoundingClientRect().top + window.pageYOffset - offset;

  window.scrollTo({
    top: targetPosition,
    behavior
  });
};

export const scrollToTop = (behavior: ScrollBehavior = 'smooth') => {
  window.scrollTo({
    top: 0,
    behavior
  });
};

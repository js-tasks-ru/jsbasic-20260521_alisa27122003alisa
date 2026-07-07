import createElement from "../../assets/lib/create-element.js";

export default class StepSlider {
  constructor({ steps, value = 0 }) {
    this.steps = steps;
    this.value = value;
    this.elem = this.renderSlider();
    this.isDragging = false;

    this.moveSliderBound = this.moveSlider.bind(this);
    this.dropSliderBound = this.dropSlider.bind(this);

    if (this.elem) {
      this.thumb = this.elem.querySelector(".slider__thumb");
      this.sliderSteps = this.elem.querySelector(".slider__steps");
      this.progress = this.elem.querySelector(".slider__progress");
    }

    this.init();
  }

  renderSlider() {
    return createElement(
      `
      <div class="slider">
        <div class="slider__thumb" style="left: 0%">
          <span class="slider__value">0</span>
        </div>

        <div class="slider__progress" style="width: 0%"></div>

        <div class="slider__steps">
        </div>
      </div>
      `,
    );
  }

  renderSliderSteps() {
    this.sliderSteps.innerHTML = "";

    for (let i = 0; i < this.steps; i++) {
      let step = document.createElement("span");
      step.dataset.id = i;
      step.classList.add("slider__step");

      if (i === this.value) {
        step.classList.add("slider__step-active");
      }

      this.sliderSteps.appendChild(step);
    }
  }

  calculateData(e) {
    const sliderRect = this.elem.getBoundingClientRect();
    let leftPX = e.clientX - sliderRect.left;
    let leftRelative = leftPX / sliderRect.width;

    if (leftRelative < 0) leftRelative = 0;
    if (leftRelative > 1) leftRelative = 1;

    const valuePercents = leftRelative * 100;
    const approximateValue = leftRelative * (this.steps - 1);
    const value = Math.round(approximateValue);

    return { value, valuePercents };
  }

  updateActiveStep() {
    const steps = this.elem.querySelectorAll(".slider__step");
    steps.forEach((step) => step.classList.remove("slider__step-active"));

    steps[this.value].classList.add("slider__step-active");
  }

  slideClick() {
    this.elem.addEventListener("click", (e) => {
      const { value, valuePercents } = this.calculateData(e);

      const percents = (value / (this.steps - 1)) * 100;
      this.thumb.style.left = `${percents}%`;
      this.progress.style.width = `${percents}%`;
      this.elem.querySelector(".slider__value").textContent = `${value}`;

      this.value = value;

      this.bindEvents();
      this.updateActiveStep();
    });
  }

  selectSlider(e) {
    this.thumb.ondragstart = () => false;
    e.preventDefault();
    this.isDragging = true;
    this.elem.classList.add("slider_dragging");
    this.thumb.style.position = "relative";
    this.thumb.style.zIndex = 1000;

    const { value, valuePercents } = this.calculateData(e);
    this.value = value;
    this.thumb.style.left = `${valuePercents}%`;
    this.progress.style.width = `${valuePercents}%`;
    this.elem.querySelector(".slider__value").textContent = `${value}`;

    document.addEventListener("pointermove", this.moveSliderBound);
    document.addEventListener("pointerup", this.dropSliderBound);
    document.addEventListener("pointerleave", this.dropSliderBound);
  }

  moveSlider(e) {
    if (!this.isDragging) return;
    e.preventDefault();

    const { value, valuePercents } = this.calculateData(e);
    this.value = value;
    this.thumb.style.left = `${valuePercents}%`;
    this.progress.style.width = `${valuePercents}%`;
    this.elem.querySelector(".slider__value").textContent = `${this.value}`;
  }

  dropSlider(e) {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.elem.classList.remove("slider_dragging");

    const percents = (this.value / (this.steps - 1)) * 100;
    this.thumb.style.left = `${percents}%`;
    this.progress.style.width = `${percents}%`;
    this.updateActiveStep();

    document.removeEventListener("pointermove", this.moveSliderBound);
    document.removeEventListener("pointerup", this.dropSliderBound);
    document.removeEventListener("pointerleave", this.dropSliderBound);

    this.bindEvents();
    this.renderSliderSteps();
  }

  bindEvents() {
    const sliderAddEvent = new CustomEvent("slider-change", {
      detail: this.value,
      bubbles: true,
    });
    this.elem.dispatchEvent(sliderAddEvent);
  }

  init() {
    this.renderSliderSteps();
    this.thumb.style.left = `${(this.value / (this.steps - 1)) * 100}%`;
    this.progress.style.width = `${(this.value / (this.steps - 1)) * 100}%`;
    this.elem.querySelector(".slider__value").textContent = `${this.value}`;

    this.slideClick();

    const selectSliderBound = this.selectSlider.bind(this);
    this.thumb.addEventListener("pointerdown", selectSliderBound);
  }
}

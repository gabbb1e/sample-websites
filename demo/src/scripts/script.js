document.addEventListener("DOMContentLoaded", function () {
  // HTML elements
  var body = document.body;

  // Test Lazy Load Picture ====================================================================================================
  // Check if an element is in or near the viewport
  function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >=
        (-window.innerHeight * 0.5 ||
          -document.documentElement.clientHeight * 0.5) &&
      rect.left >=
        (-window.innerWidth * 0.5 ||
          -document.documentElement.clientWidth * 0.5) &&
      rect.bottom <=
        (window.innerHeight * 1.5 ||
          document.documentElement.clientHeight * 1.5) &&
      rect.right <=
        (window.innerWidth * 1.5 || document.documentElement.clientWidth * 1.5)
    );
  }

  // Lazy load function
  function lazyLoad() {
    const pictures = document.querySelectorAll("picture");

    pictures.forEach((picture) => {
      const sources = picture.querySelectorAll("source");
      const img = picture.querySelector("img");

      // If true, swap the data-src to srt to display the image
      if (isInViewport(img)) {
        const src = img.getAttribute("data-src");
        if (src) {
          img.src = src;
          img.removeAttribute("data-src"); // Remove the temp src
        }
      }
      // Same with img, but there can be multiple source so we loop through them
      sources.forEach((source) => {
        if (isInViewport(source)) {
          const srcset = source.getAttribute("data-srcset");
          if (srcset) {
            source.srcset = srcset;
            source.removeAttribute("data-srcset");
          }
        }
      });
    });
  }
  // Initial lazy loading
  lazyLoad();

  // Add a delay for when to call the function again
  function debounce(func, delay) {
    let timeoutId;
    return function () {
      const context = this;
      const args = arguments;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(context, args);
      }, delay);
    };
  }
  const debouncedLazyLoad = debounce(lazyLoad, 10);

  // Attach the debounced event handler to the scroll event
  window.addEventListener("scroll", debouncedLazyLoad);

  // Sidebar ===============================================================================================================
  var sidebar_controller = document.getElementById("sidebar-control");
  var sidebar_container = document.getElementById("sidebar");

  const deactivateSidebar = () => {
    sidebar_container.classList.remove("active");
    sidebar_controller.classList.remove("active");
    body.classList.remove("pause-scroll"); // Remove pause scrolling when sidebar is not active
  };

  // Handle sidebar toggle
  sidebar_controller.addEventListener("click", function () {
    // Toggle sidebar and controller
    sidebar_container.classList.toggle("active");
    sidebar_controller.classList.toggle("active");

    // Prevent body from scrolling when sidebar modal is active
    if (sidebar_container.classList.contains("active")) {
      body.classList.add("pause-scroll");
    } else {
      body.classList.remove("pause-scroll");
    }
  });

  // Dropdown ===============================================================================================================
  // Dropdown of solutions when on Desktop view
  var dropdown_controller = document.getElementById("solution-dropdown");
  var dropdown_container = document.getElementById("dropdown");
  var dropdown_icon = document.getElementById("dropdown-icon");

  const deactivateDropdown = () => {
    dropdown_container.classList.remove("active");
    dropdown_controller.classList.remove("active");
  };

  // Handle dropdown toggle
  dropdown_controller.addEventListener("click", function (e) {
    dropdown_container.classList.toggle("active");
    dropdown_icon.classList.toggle("active");
  });

  // Handle dropdown images to load after transition
  dropdown_controller.addEventListener("transitionend", function () {
    lazyLoad();
  });

  // Collapse ===============================================================================================================
  // Solution collapse on mobile view
  // Set elements
  var collapse_controller = document.getElementById("collapse-controller");
  var collapse_container = document.getElementById("collapse-container");
  var collapse_icon = document.getElementById("collapse-icon");

  const deactivateCollapse = () => {
    setTimeout(function () {
      collapse_icon.classList.remove("active");
      collapse_container.classList.remove("active");
    });
  };

  // Handle toggle Collapse
  const togglecollapse = () => {
    collapse_icon.classList.toggle("active");
    collapse_container.classList.toggle("active");
  };

  // Handle click event for collapse controller
  collapse_controller.addEventListener("click", function () {
    // Check if collapse container is active, set its display to flex if not active to be able to handle transition
    if (!collapse_container.classList.contains("active")) {
      collapse_container.style.display = "flex";
    }
    // Add a small delay to set its display to flex before toggling to handle transition
    setTimeout(function () {
      togglecollapse();
    }, 10);
    lazyLoad();
  });

  // collapse after transition
  collapse_container.addEventListener("transitionend", function (e) {
    // Check if transition is max-height or not
    if (e.propertyName !== "max-height") return;
    // Set display to none if not active
    if (!collapse_container.classList.contains("active")) {
      collapse_container.style.display = "none";
    }
    lazyLoad();
  });

  // Infinite slider carousel =============================================================================================
  const slider = document.querySelector(".slider");
  const carousel = document.querySelector(".carousel");
  const items = carousel.querySelectorAll(".slider article");

  // Indicator
  const buttonsHtml = Array.from(items, () => {
    return `<span class="carousel-button"></span>`;
  });
  carousel.insertAdjacentHTML(
    "beforeend",
    `<div class="carousel-nav">
      ${buttonsHtml.join("")}
    </div>`
  );
  // Set buttons
  const buttons = carousel.querySelectorAll(".carousel-button");

  // Controls
  const prev = document.querySelector(".prev");
  const next = document.querySelector(".next");
  var direction;

  // var
  var slide = 0; // Current slide
  var step = 1; // Handle multiple step slide
  var clicked = false; // Checker to avoid spam and having a sync issue with indicator and slide

  // Control event listener
  prev.addEventListener("click", function () {
    if (clicked) return;
    clicked = true;

    if (direction !== 1) {
      slider.appendChild(slider.firstElementChild);
      direction = 1;
    }
    slide -= 1;

    carousel.style.justifyContent = "flex-end";
    slider.style.transform = "translate(calc(100% / 3))";
  });
  // Next
  next.addEventListener("click", function () {
    if (clicked) return;
    clicked = true;

    if (direction === 1) {
      slider.prepend(slider.lastElementChild);
    }
    slide += 1;

    direction = -1;
    carousel.style.justifyContent = "flex-start";
    slider.style.transform = "translate(calc(-100% / 3))";
  });

  // Slider transition
  slider.addEventListener("transitionend", function (e) {
    if (e.propertyName !== "transform") return;

    console.log(direction);
    for (let i = 0; i < step; i++) {
      if (direction === -1) {
        slider.appendChild(slider.firstElementChild);
      } else if (direction === 1) {
        slider.prepend(slider.lastElementChild);
      }
    }

    step = 1;
    if (slide < 0) slide = items.length - 1;
    if (slide >= items.length) slide = 0;

    slider.style.transition = "none";
    slider.style.transform = "translate(0)";
    setTimeout(function () {
      slider.style.transition = "all 0.5s";
    });
    updateActiveButton();

    lazyLoad();
    clicked = false;
  });

  // Update active button
  function updateActiveButton() {
    // const activeItem = document.querySelector(".item.active");
    buttons.forEach((button, index) => {
      if (slide === index) {
        buttons[index].classList.add("selected");
      } else {
        buttons[index].classList.remove("selected");
      }
    });
  }

  // Indicator event listener
  buttons.forEach((button, index) => {
    button.addEventListener("click", () => {
      if (clicked) return;
      clicked = true;

      if (index < slide) {
        if (direction !== 1) {
          slider.appendChild(slider.firstElementChild);
          direction = 1;
        }
        carousel.style.justifyContent = "flex-end";

        step = slide - index;
        slider.style.transform = `translate(calc(100% / 3 * ${step}))`;
        slide = index;
      } else if (index > slide) {
        // console.log(` dir ${direction}`);
        if (direction === 1) {
          slider.prepend(slider.lastElementChild);
        }
        carousel.style.justifyContent = "flex-start";
        direction = -1;

        step = index - slide;
        slider.style.transform = `translate(calc(-100% / 3 * ${step}))`;
        slide = index;
      }

      updateActiveButton();
      lazyLoad();
    });
  });

  updateActiveButton();

  // Hover carousel =============================================================================================
  var articles = document.querySelectorAll(".section4-container article");

  // Function to handle mouse enter event
  function handleMouseEnter(article) {
    var id = article.getAttribute("for");
    var img_container = document.getElementById(id);
    img_container.style.opacity = 1;
  }

  // Function to handle mouse leave event
  function handleMouseLeave(article) {
    if (window.innerWidth > 768) {
      var id = article.getAttribute("for");
      var img_container = document.getElementById(id);
      img_container.style.opacity = 0;
    } else {
      var id = article.getAttribute("for");
      var img_container = document.getElementById(id);
      img_container.style.opacity = 0.5;
    }
  }

  // Event listeners for mouse enter and leave events
  articles.forEach(function (article) {
    article.addEventListener("mouseenter", function () {
      handleMouseEnter(article);
    });

    article.addEventListener("mouseleave", function () {
      handleMouseLeave(article);
    });
  });

  // Global functions ================================================================================================================
  window.onresize = function () {
    // Check if screen width is above 768 pixels
    if (window.innerWidth > 768) {
      deactivateSidebar();
      deactivateCollapse();
    } else {
      deactivateDropdown();
    }

    articles.forEach(function (article) {
      if (!article.classList.contains("active")) {
        handleMouseLeave(article);
      }
    });
    lazyLoad();
  };

  window.onscroll = function () {
    if (dropdown_icon !== null) {
      dropdown_container.classList.remove("active");
      dropdown_icon.classList.remove("active");
    }
  };

  // Call on load
  articles.forEach(function (article) {
    if (!article.classList.contains("active")) {
      handleMouseLeave(article);
    }
  });
});

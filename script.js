const data = {
    1: {
      img: "images/photo1.jpg",
      text: "Пусть у тебя будет больше спокойных дней."
    },
    2: {
      img: "images/photo2.jpg",
      text: "Этот момент мне был особенно тёплым."
    },
    3: {
      img: "",
      text: "Иногда и этого достаточно."
    }
  };
  
  function openCell(id) {
    document.getElementById("modal").classList.remove("hidden");
    document.getElementById("modal-img").src = data[id].img;
    document.getElementById("modal-text").innerText = data[id].text;
  }
  
  function closeCell() {
    document.getElementById("modal").classList.add("hidden");
  }
  

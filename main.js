//? АПИ для запросов
const API = "http://localhost:8000/products";

//? блок куда мы добавляем карточки
const list = document.querySelector("#products-list");

//? форма с инпутами для ввода данных
const addForm = document.querySelector("#add-form");
const titleInp = document.querySelector("#title");
const priceInp = document.querySelector("#price");
const descriptionInp = document.querySelector("#description");
const imageInp = document.querySelector("#image");

//? инпуты и кнопка из модалки
const editTitleInp = document.querySelector("#edit-title");
const editPriceInp = document.querySelector("#edit-price");
const editDescriptionInp = document.querySelector("#edit-descr");
const editImageInp = document.querySelector("#edit-image");
const editSaveBtn = document.querySelector("#btn-save-edit");

//? инпут для поиска
const searchInput = document.querySelector("#search");
//? переменная по которой делаем запрос на поиск
let searchVal = "";

//? то где отображаем кнопку пагинации
const paginationList = document.querySelector(".pagination-list");
const prev = document.querySelector(".prev");
const next = document.querySelector(".next");
//? максимальное количество продуктов на одной странице
const limit = 3;
//? текущая страница
let currentPage = 1;
//? максимальное количество страниц
let pageTotalCount = 1;

//? первоначальное отображение данных
getProducts();

//? это функция для получения данных
async function getProducts() {
  const res = await fetch(
    `${API}?title_like=${searchVal}&_limit=${limit}&_page=${currentPage}`
    //?title_like для поиска по ключу
    //? q для поиска по всем ключам
    //? _limit для того чтобы указать максимальное количество элементов на одной странице
    //? _page получить данные на определенной странице
  );
  //? x-total-count общее количество продуктов
  const count = res.headers.get("x-total-count");
  //? формула чтобы высчитать максимальное количество страниц
  pageTotalCount = Math.ceil(count / limit);
  const data = await res.json(); //? расшифровка данных
  //? отображаем актуальные данные
  render(data);
}

//? функция для добавления в db.json
async function addProduct(product) {
  //? await для того чтобы getProducts подождала пока данные добавяться
  await fetch(API, {
    method: "POST",
    body: JSON.stringify(product),
    headers: {
      "Content-Type": "application/json",
    },
  });
  //? стянуть и отобразить акутльные данные
  getProducts();
}

//? функция для удаления из db.json
async function deleteProduct(id) {
  //? await для того чтобы getProducts подождала пока данные добавяться
  await fetch(`${API}/${id}`, {
    method: "DELETE",
  });
  getProducts();
}

//? функция для получения одного продукта
async function getOneProduct(id) {
  const res = await fetch(`${API}/${id}`);
  const data = await res.json(); //? расшифровка данных
  return data; //? возвращаем продукт с db.json
}

//? функция для изменение данных
async function editProduct(id, editedProduct) {
  await fetch(`${API}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(editedProduct),
    headers: {
      "Content-Type": "application/json",
    },
  });
  getProducts();
}

//? это функция для отоброжение на странице
function render(arr) {
  //? чтобы наши карточки не дублировались
  list.innerHTML = "";
  arr.forEach((item) => {
    list.innerHTML += `<div class="card m-5" style="width: 18rem">
    <img
      src="${item.image}"
      class="card-img-top w-100"
      alt="..."
    />
    <div class="card-body">
    <h5 class="card-title">${item.title}</h5>
    <p class="card-text">${item.description.slice(0, 70)}...</p>
    <p class="card-text">$ ${item.price}</p>
    <button data-bs-toggle="modal"
    data-bs-target="#exampleModal" id="${
      item.id
    }" class="btn btn-dark btn-edit">EDIT</button>
    <button id="${item.id}" class="btn btn-danger btn-delete">DELETE</button>
    </div>
  </div>`;
  });
  renderPagination();
}

//? вешаем обработчик события для добавления (CREATE)
addForm.addEventListener("submit", (e) => {
  //? чтобы страница не перезагружалась
  e.preventDefault();

  //? проверка на заполненность полей
  if (
    !titleInp.value.trim() ||
    !priceInp.value.trim() ||
    !descriptionInp.value.trim() ||
    !imageInp.value.trim()
  ) {
    alert("Заполните все поля");
    return;
  }

  //? создаем обьект для отправки в db.json
  const product = {
    title: titleInp.value,
    price: priceInp.value,
    description: descriptionInp.value,
    image: imageInp.value,
  };

  //? отправляем данные в db.json
  addProduct(product);

  //? очищаем инпуты
  titleInp.value = "";
  priceInp.value = "";
  descriptionInp.value = "";
  imageInp.value = "";
});

//? обработчик события для удаления
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-delete")) {
    deleteProduct(e.target.id);
  }
});

//? переменная чтобы сохранить id продукта на который мы нажали
let id = null;

//? обработчик события на открытие и заполнения модалки
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-edit")) {
    //? сохраняем id продукта
    id = e.target.id;
    //? получаем обьект продукта на который мы нажали
    //?await потому что getOneProduct асинхронная функция
    const product = await getOneProduct(e.target.id);
    //? заполняем инпуты данными продукта
    editTitleInp.value = product.title;
    editPriceInp.value = product.price;
    editDescriptionInp.value = product.description;
    editImageInp.value = product.image;
  }
});

//? обработчик события на сохранение данных
editSaveBtn.addEventListener("click", () => {
  //? проверка на пустоту инпутов
  if (
    !editTitleInp.value.trim() ||
    !editPriceInp.value.trim() ||
    !editDescriptionInp.value.trim() ||
    !editImageInp.value.trim()
  ) {
    alert("Заполните все поля");
    //? если хотябы один инпут пустой выводим предупреждение и останавливаем функцию
    return;
  }
  //? собираем измененный обьект для изменения продукта
  const editedProduct = {
    title: editTitleInp.value,
    price: editPriceInp.value,
    description: editDescriptionInp.value,
    image: editImageInp.value,
  };
  //? вызываем функцию для изменения
  editProduct(id, editedProduct);
});

//? обработчик события для поиска
searchInput.addEventListener("input", () => {
  searchVal = searchInput.value;
  currentPage = 1;
  getProducts();
});

//? функция для отображения кнопок для пагинации
function renderPagination() {
  paginationList.innerHTML = "";
  for (let i = 1; i <= pageTotalCount; i++) {
    paginationList.innerHTML += `
    <li class="page-item ${currentPage == i ? "active" : ""}">
    <button class="page-link page_number">${i}</button>
  </li>
    `;
  }
  //? чтобы кнопка prev была не активна на первой странице
  if (currentPage == 1) {
    prev.classList.add("disabled");
  } else {
    prev.classList.remove("disabled");
  }

  //? чтобы кнопка next была не активна на первой странице
  if (currentPage == pageTotalCount) {
    next.classList("disabled");
  } else {
    next.classList.remove("disabled");
  }
}

//? обработчик события чтобы перейти на определенную страницу
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("page_number")) {
    currentPage = e.target.innerText;
    getProducts();
  }
});

//? обработчик события чтобы перейти на следующию страницу
next.addEventListener("click", () => {
  if (currentPage == pageTotalCount) {
    return;
  }
  currentPage++;
  getProducts();
});

//? обработчик события чтобы перейти на предыдущую страницу
prev.addEventListener("click", () => {
  if (currentPage == 1) {
    return;
  }
  currentPage--;
  getProducts();
});

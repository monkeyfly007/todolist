/*
 * @Author: jinyu
 * @Date: 2022-03-13 21:36:18
 * @LastEditors: jinyu
 * @LastEditTime: 2022-03-14 14:40:37
 * @Description: 提供一个入口函数 type TRender = (xxx: any, container: HTMLElement) => void;
 */

let todoList = [];
// let allList = []; // 全部
// let doneList = []; // 已完成
// let undoneList = []; // 未完成
const todoListContainer = document.getElementById("todoList");
const addListInput = document.getElementById("addList");
const checkAllEle = document.getElementById("checkAll");
const todoCountEle = document.getElementById("todoCount");
const doneCountEle = document.getElementById("doneCount");
const clearEle = document.getElementById("clear");
addListInput.addEventListener("keyup", addTodoList);
checkAllEle.addEventListener("click", checkAllTodoList);
clearEle.addEventListener("click", clearDoneItem);
let filterType = "all";

!(function () {
  window.addEventListener("load", renderTodoList);
})();

// export default function TRender(template, container) {
//   container.innerHTML = template;
// }

// 筛选待办事项
function filterTodoList(type) {
  if (type === "done") {
    doneList = todoList.filter((item) => item.completed === true);
  } else if (type === "todo") {
    undoneList = todoList.filter((item) => item.completed === false);
  } else {
    allList = todoList;
  }
  filterType = type;
  renderTodoList();
}

// 清除已完成事项
function clearDoneItem() {
  todoList = todoList.filter((item) => item.completed === false);
  renderTodoList();
}

// 全选
function checkAllTodoList(e) {
  const checkAll = e.target.checked;
  if (checkAll) {
    todoList.forEach((item) => (item.completed = true));
  } else {
    todoList.forEach((item) => (item.completed = false));
  }
  renderTodoList();
}

// 渲染todolist
function renderTodoList() {
  let list = [],
    allList = [...todoList];
  doneList = todoList.filter((item) => item.completed);
  undoneList = todoList.filter((item) => !item.completed);
  if (filterType === "all") {
    // 全部
    list = allList;
  } else if (filterType === "done") {
    // 已完成
    list = doneList;
  } else if (filterType === "todo") {
    // 未完成
    list = undoneList;
  }
  // console.log(todoList, "render");
  let content = ``;
  const noData = `<p class="nodata">暂无数据</p>`;
  const extra = `<div class="tag-select">
  <span class="tag tag-all" onclick='filterTodoList("all")'>全部</span>
  <span class="tag tag-done" onclick='filterTodoList("done")'>已完成</span>
  <span class="tag tag-todo" onclick='filterTodoList("todo")'>未完成</span>
</div>`;
  if (list && list.length) {
    todoListContainer.classList.remove("todoList-nodata");
    for (var i = 0; i < list.length; i++) {
      const item = list[i];
      const status = item.completed ? "done" : "todo";
      content += `<li class="todo-item todo-item-${status} ${
        item.edit ? "item-editable" : ""
      }">
        <i class="status status-${status}" onclick="clickTodoItem(${i}, ${
        item.completed
      }, event)"></i>
        <input type="text" class="editable" onblur="saveItem(${i}, false, this)" onkeyup="handleEnterEdit(${i}, false, event)" />
        <span class="item-value" onclick="toggleEdit(${i}, '${
        item.name
      }', event)">${item.name}</span>
        <span class="delete" onclick="removeItem(${i})">删除</span>
        </li>`;
    }
    content = content + extra;
  } else {
    todoListContainer.classList.add("todoList", "todoList-nodata");
    if (!allList.length) {
      // 全部无数据时，不展示 extra 部分
      content = noData;
    } else if (!doneList.length || !undoneList.length) {
      content += noData + extra;
    }
  }
  // 更新列表状态
  updateTodoListStatus(allList);
  // 更新全选CheckBox状态
  updateAllCheckStatus(allList);
  todoListContainer.innerHTML = content;
  // 更新标签样式
  updateTagStatus();
}

// 文本框失去焦点后保存数据
function handleEnterEdit(index, edit, event) {
  if (event.keyCode === 13) {
    saveItem(index, edit, event.target);
  }
}

// 失去焦点后报错文本框数据
function saveItem(index, edit, inputEle) {
  if (!inputEle.value) return false;
  //   console.log(inputEle, "editBlur");
  todoList.forEach((item, _index) => {
    if (index === _index) {
      item.name = inputEle.value;
      item.edit = edit;
    }
  });
  renderTodoList();
}

// 开启编辑模式
function toggleEdit(index, name, event) {
  todoList.forEach((item, _index) => {
    if (index === _index) {
      item.edit = !item.edit;
    } else {
      item.edit = false;
    }
  });
  // console.log(event, event.target.previousElementSibling);
  renderTodoList();
  setTimeout(() => {
    const inputEle = todoListContainer.children[index].children[1];
    inputEle.value = name;
    inputEle.focus();
  }, 0);
}

// 更新全选 checkbox 状态
function updateAllCheckStatus(todoList) {
  if (!todoList.length) {
    checkAllEle.checked = false;
    checkAllEle.disabled = true;
  } else {
    checkAllEle.disabled = false;
    const doneCount = todoList.filter((item) => item.completed).length;
    if (todoList.length === doneCount) {
      checkAllEle.checked = true;
    } else {
      checkAllEle.checked = false;
    }
  }
}

// 更新底部 tag 状态
function updateTagStatus() {
  const tagWrapper = document.querySelector(".tag-select");
  if (tagWrapper) {
    const tags = tagWrapper.children;
    Array.from(tags).forEach((tag, index) => {
      const className = `tag-${filterType}`;
      if (tag.classList.contains(className)) {
        tag.classList.add("tag", className, "selected");
      } else {
        tag.classList.remove("selected");
      }
    });
  }
}

// 更新todolist列表状态（未完成、已完成）
function updateTodoListStatus(todoList) {
  console.log(todoList, "update");
  const total = todoList.length;
  const doneCount = todoList.filter((item) => item.completed).length;
  const todoCount = total - doneCount;
  todoCountEle.innerHTML = todoCount;
  doneCountEle.innerHTML = doneCount;
  if (!doneCount) {
    clearEle.setAttribute("disabled", true);
  } else {
    clearEle.removeAttribute("disabled");
  }
}

// 更新列表项状态
function updateItem(i, status) {
  todoList[i].completed = !status;
}

// 点击当前行
function clickTodoItem(i, status) {
  updateItem(i, status);
  renderTodoList();
}

// 移除当前项
function removeItem(index) {
  // console.log(todoList, 'remove')
  todoList.splice(index, 1);
  renderTodoList();
}

// 新增todo item
function addTodoList(event) {
  if (event.keyCode === 13) {
    const todoItem = {
      name: "",
      completed: false,
      edit: false,
    };

    const inputVal = addListInput.value.trim();
    if (inputVal === "") {
      return;
    }
    const item = {
      ...todoItem,
      name: inputVal,
    };
    //  数据存储
    todoList.push(item);
    //  重置输入框
    resetInput();
    // 更新 全选 CheckBox 状态
    // updateAllCheckStatus(todoList);
    //  渲染todolist
    renderTodoList();
  }
}

// 清空 input
function resetInput() {
  addListInput.value = "";
}

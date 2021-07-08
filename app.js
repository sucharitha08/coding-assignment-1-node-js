const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const datefns = require("date-fns");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const acceptedStatusValues = ["TO DO", "IN PROGRESS", "DONE"];
const acceptedPriorityValues = ["HIGH", "MEDIUM", "LOW"];
const acceptedCategoryValues = ["WORK", "HOME", "LEARNING"];

const validStatus = (request, response, next) => {
  if ("status" in request.query) {
    const { status } = request.query;
    if (acceptedStatusValues.includes(status)) {
      next();
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else {
    next();
  }
};
const validPriority = (request, response, next) => {
  if ("priority" in request.query) {
    const { priority } = request.query;
    if (acceptedPriorityValues.includes(priority)) {
      next();
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else {
    next();
  }
};
const validCategory = (request, response, next) => {
  if ("category" in request.query) {
    const { category } = request.query;
    if (acceptedCategoryValues.includes(category)) {
      next();
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } else {
    next();
  }
};
const validDueDate = (request, response, next) => {
  /*const { date } = request.query;
  const year = date.substring(0, 4);
  const month = date.substring(5, 6);
  const day = date.substring(7, 9);
  const formatDate = new Date((year, month, day), "yyyy-MM-dd");
  const result = isMatch(formatDate, "yyyy-MM-dd");*/
  if ("date" in request.query) {
    const { date } = request.query;
    if (datefns.isMatch(date, "yyyy-MM-dd")) {
      const datef = datefns.format(new Date(`${date}`), "yyyy-MM-dd");
      request.date = datef;
      next();
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  } else {
    next();
  }
};

const postValidStatus = (request, response, next) => {
  if ("status" in request.body) {
    const { status } = request.body;
    if (acceptedStatusValues.includes(status)) {
      next();
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else {
    next();
  }
};

const postValidPriority = (request, response, next) => {
  if ("priority" in request.body) {
    const { priority } = request.body;
    if (acceptedPriorityValues.includes(priority)) {
      next();
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else {
    next();
  }
};
const postValidCategory = (request, response, next) => {
  if ("category" in request.body) {
    const { category } = request.body;
    if (acceptedCategoryValues.includes(category)) {
      next();
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } else {
    next();
  }
};
const postValidDueDate = (request, response, next) => {
  if ("dueDate" in request.body) {
    const { dueDate } = request.body;
    if (datefns.isMatch(dueDate, "yyyy-MM-dd")) {
      const datef = datefns.format(new Date(`${dueDate}`), "yyyy-MM-dd");
      request.dueDate = datef;
      next();
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  } else {
    next();
  }
};
app.get(
  "/todos/",
  validStatus,
  validPriority,
  validCategory,
  async (request, response) => {
    console.log(request.query);
    let data = null;
    let getTodosQuery = "";
    const { search_q = "", priority, status, category } = request.query;
    if ("status" in request.query) {
      getTodosQuery = `
      SELECT
        id,todo,priority,category,status,due_date AS dueDate
      FROM
        todo 
      WHERE
        status = '${status}';`;
    } else if ("priority" in request.query) {
      getTodosQuery = `
      SELECT
        id,todo,priority,category,status,due_date AS dueDate
      FROM
        todo 
      WHERE
        priority = '${priority}';`;
    } else if ("priority" in request.query && "status" in request.query) {
      getTodosQuery = `
      SELECT
        id,todo,priority,category,status,due_date AS dueDate
      FROM
        todo 
      WHERE
        status = '${status}'
        AND priority = '${priority}';`;
    } else if ("search_q" in request.query) {
      getTodosQuery = `
      SELECT
        id,todo,priority,category,status,due_date AS dueDate
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%';`;
    } else if ("category" in request.query && "status" in request.query) {
      getTodosQuery = `
      SELECT
        id,todo,priority,category,status,due_date AS dueDate
      FROM
        todo 
      WHERE
        category = '${category}'
        AND status = '${status}';`;
    } else if ("category" in request.query && "priority" in request.query) {
      getTodosQuery = `
      SELECT
        id,todo,priority,category,status,due_date AS dueDate
      FROM
        todo 
      WHERE
        category = '${category}'
        AND priority = '${priority}';`;
    } else if ("category" in request.query) {
      getTodosQuery = `
      SELECT
        id,todo,priority,category,status,due_date AS dueDate
      FROM
        todo 
      WHERE
        category = '${category}';`;
    }
    data = await database.all(getTodosQuery);
    response.send(data);
  }
);

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const getTodoQuery = `
    SELECT
      id,todo,priority,category,status,due_date AS dueDate
    FROM
      todo
    WHERE
      id = ${todoId};`;
  const todo = await database.get(getTodoQuery);
  response.send(todo);
});
app.get("/agenda/", validDueDate, async (request, response) => {
  const { date } = request.query;
  const formatDate = datefns.format(new Date(`${date}`), "yyyy-MM-dd");
  const getQuery = `SELECT id,todo,priority,category,status,due_date AS dueDate FROM todo WHERE due_date=${formatDate};`;
  const result = await database.all(getQuery);
  return result;
});
app.post(
  "/todos/",
  postValidStatus,
  postValidPriority,
  postValidCategory,
  postValidDueDate,
  async (request, response) => {
    const { id, todo, priority, status, category, dueDate } = request.body;
    const postTodoQuery = `
    INSERT INTO
        todo (id, todo, priority, status,category,due_date)
    VALUES
        (${id}, '${todo}', '${priority}', '${status}', '${category}','${dueDate}');`;
    await database.run(postTodoQuery);
    response.send("Todo Successfully Added");
  }
);

app.put(
  "/todos/:todoId/",
  postValidStatus,
  postValidPriority,
  postValidCategory,
  postValidDueDate,
  async (request, response) => {
    const { todoId } = request.params;
    let updateColumn = "";
    let updateTodoQuery;
    const requestBody = request.body;
    console.log(requestBody);
    if ("status" in request.body) {
      updateColumn = "Status";
      const { status } = request.body;
      let updateTodoQuery = `
        UPDATE
        todo
        SET
        status='${status}'
        WHERE
        id = ${todoId};`;
    } else if ("priority" in request.body) {
      updateColumn = "Priority";
      const { priority } = request.body;
      let updateTodoQuery = `
        UPDATE
        todo
        SET
        priority='${priority}'
        WHERE
        id = ${todoId};`;
    } else if ("todo" in request.body) {
      updateColumn = "Todo";
      const { todo } = request.body;
      let updateTodoQuery = `
        UPDATE
        todo
        SET
        todo='${todo}'
        WHERE
        id = ${todoId};`;
    } else if ("category" in request.body) {
      updateColumn = "Category";
      const { category } = request.body;
      let updateTodoQuery = `
        UPDATE
        todo
        SET
        category = '${category}'
        WHERE
        id = ${todoId};`;
    } else if ("dueDate" in request.body) {
      updateColumn = "Due Date";
      const { dueDate } = request.body;
      let updateTodoQuery = `
        UPDATE
        todo
        SET
        due_date = '${dueDate}'
        WHERE
        id = ${todoId};`;
    }
    await database.run(updateTodoQuery);
    response.send(`${updateColumn} Updated`);
  }
);
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
  DELETE FROM
    todo
  WHERE
    id = ${todoId};`;

  await database.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;

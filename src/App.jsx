import { useState, useRef, useEffect } from "react";
import { Toaster, toast } from "sonner";
import "./App.css";

const App = () => {
  const storedToDos = JSON.parse(localStorage.getItem("toDos")) || [];

  const [toDos, setToDos] = useState(storedToDos);

  const [filteredToDos, setFilteredToDos] = useState([...toDos]);

  const [count, setCount] = useState(() => toDos.length);

  const toDoRef = useRef();

  useEffect(() => {
    localStorage.setItem("toDos", JSON.stringify(toDos));

    const filter = toDoRef.current
      .querySelector(".filters")
      .querySelector(".active");

    if (filter.innerText === "All") {
      setFilteredToDos(toDos);
      setCount(toDos.length);
    }

    if (filter.innerText === "Active") {
      const updatedToDos = toDos.filter((toDo) => !toDo.completed);

      setFilteredToDos(updatedToDos);
      setCount(updatedToDos.length);
    }

    if (filter.innerText === "Completed") {
      const updatedToDos = toDos.filter((toDo) => toDo.completed);

      setFilteredToDos(updatedToDos);
      setCount(updatedToDos.length);
    }
  }, [toDos]);

  const updateToDos = (action, id) => {
    const notify = (notification) => {
      const toastId = toast("Sonner");

      if (notification.type === "success") {
        toast.success(notification.message, { id: toastId });
      }

      if (notification.type === "info") {
        toast.info(notification.message, { id: toastId });
      }

      if (notification.type === "warning") {
        toast.warning(notification.message, { id: toastId });
      }
    };

    if (action === "ADD") {
      const currentBtn = toDoRef.current.querySelector("#add-btn").innerText;
      const text = toDoRef.current.querySelector("#toDoInput").value.trim();
      const dataId = toDoRef.current
        .querySelector("#add-btn")
        .getAttribute("data-id");

      const toDoExist = toDos.some(
        (toDo) =>
          toDo.text.toLowerCase() === text.toLowerCase() && toDo.id !== dataId
      );

      if (text && !toDoExist) {
        if (currentBtn === "ADD") {
          toDoRef.current.querySelector("#toDoInput").value = "";

          setToDos((t) => [
            { id: Date.now().toString(), text, completed: false },
            ...t,
          ]);

          notify({ type: "success", message: "Successfully added!" });
        } else {
          toDoRef.current.querySelector("#add-btn").removeAttribute("data-id");

          setToDos((t) => {
            const toDos = [...t];

            const updatedToDos = toDos.map((toDo) =>
              toDo.id === dataId ? { ...toDo, text } : toDo
            );

            return updatedToDos;
          });

          toDoRef.current.querySelector("#toDoInput").value = "";
          toDoRef.current.querySelector("#add-btn").innerText = action;

          notify({ type: "success", message: "Successfully edited!" });
        }
      } else {
        toDoExist
          ? notify({ type: "warning", message: "To-Do already exists!" })
          : notify({ type: "warning", message: "To-Do can't be empty!" });
      }
    }

    if (action === "EDIT") {
      const toDo = toDos.find((toDo) => toDo.id === id);
      toDoRef.current.querySelector("#toDoInput").value = toDo.text;
      toDoRef.current.querySelector("#add-btn").innerText = action;

      toDoRef.current.querySelector("#add-btn").setAttribute("data-id", id);
    }

    if (action === "DELETE") {
      const dataId = toDoRef.current
        .querySelector("#add-btn")
        .getAttribute("data-id");

      setToDos((t) => {
        const toDos = [...t];

        const updatedToDos = toDos.filter((toDo) => toDo.id !== id);

        return updatedToDos;
      });

      notify({ type: "success", message: "Successfully deleted!" });

      if (dataId === id) {
        toDoRef.current.querySelector("#add-btn").removeAttribute("data-id");

        toDoRef.current.querySelector("#toDoInput").value = "";
        toDoRef.current.querySelector("#add-btn").innerText = "ADD";
      }
    }

    if (action === "COMPLETE") {
      let marked = false;

      setToDos((t) => {
        const toDos = [...t];

        const updatedToDos = toDos.map((toDo) => {
          if (toDo.id === id) {
            if (!toDo.completed) {
              marked = true;
              return { ...toDo, completed: true };
            }

            if (toDo.completed) {
              marked = false;
              return { ...toDo, completed: false };
            }
          } else {
            return toDo;
          }
        });

        return updatedToDos;
      });

      if (marked) {
        notify({
          type: "success",
          message: "Successfully marked complete!",
        });
      } else {
        notify({
          type: "success",
          message: "Successfully unmarked!",
        });
      }
    }

    if (action === "CLEAR_COMPLETED") {
      let containMarked = false;

      setToDos((t) => {
        const toDos = [...t];

        const updatedToDos = toDos.filter((toDo) => {
          if (toDo.completed) containMarked = true;

          return !toDo.completed;
        });

        return updatedToDos;
      });

      if (containMarked) {
        notify({
          type: "success",
          message: "Successfully cleared!",
        });
      } else {
        notify({
          type: "info",
          message: "Nothing to clear!",
        });
      }
    }
  };

  const filterToDos = (e, condition) => {
    e.target.parentElement.querySelector(".active").classList.remove("active");

    e.target.classList.add("active");

    if (condition === "all") {
      setFilteredToDos(toDos);
      setCount(toDos.length);
    }

    if (condition === "active") {
      const updatedToDos = toDos.filter((toDo) => !toDo.completed);

      setFilteredToDos(updatedToDos);
      setCount(updatedToDos.length);
    }

    if (condition === "completed") {
      const updatedToDos = toDos.filter((toDo) => toDo.completed);

      setFilteredToDos(updatedToDos);
      setCount(updatedToDos.length);
    }
  };

  return (
    <div id="app">
      <div ref={toDoRef} className="todo-container">
        <h1>TO-DO</h1>
        <div className="todo-input">
          <input
            id="toDoInput"
            type="text"
            placeholder="Add a new task..."
            autoComplete="off"
          />
          <button id="add-btn" onClick={() => updateToDos("ADD")}>
            ADD
          </button>
        </div>

        <div className="todo-list">
          {filteredToDos.map((toDo) => {
            return (
              <div key={toDo.id} className="todo-item">
                <input
                  type="checkbox"
                  checked={toDo.completed}
                  onChange={() => updateToDos("COMPLETE", toDo.id)}
                />
                <span className={toDo.completed ? "completed" : ""}>
                  {toDo.text}
                </span>
                <button
                  className="edit-btn"
                  onClick={() => updateToDos("EDIT", toDo.id)}
                >
                  ✎
                </button>
                <button
                  className="delete-btn"
                  onClick={() => updateToDos("DELETE", toDo.id)}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>

        <div className="todo-footer">
          <span>{count + " " + (count > 1 ? "items" : "item")}</span>
          <div className="filters">
            <button
              className="all active"
              onClick={(e) => filterToDos(e, "all")}
            >
              All
            </button>
            <button onClick={(e) => filterToDos(e, "active")}>Active</button>
            <button onClick={(e) => filterToDos(e, "completed")}>
              Completed
            </button>
          </div>
          <button
            className="clear"
            onClick={() => {
              updateToDos("CLEAR_COMPLETED");
            }}
          >
            Clear Completed
          </button>
        </div>
      </div>
      <Toaster
        position="bottom-center"
        richColors
        toastOptions={{
          style: {
            display: "flex",
            justifyContent: "center",
            fontSize: "1.5rem",
            fontFamily: "Caveat, 'serif'",
            backgroundColor: "white",
            color: "black",
            padding: "1rem",
            borderRadius: "8px",
          },
        }}
      />
    </div>
  );
};

export default App;

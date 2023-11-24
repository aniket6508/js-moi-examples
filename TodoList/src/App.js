import React, { useEffect, useState } from "react";
import { VoyageProvider, Wallet, getLogicDriver } from 'js-moi-sdk';
import { info, success } from "./utils/toastWrapper";
import { Toaster } from "react-hot-toast";
import Loader from "./components/Loader";

const logicId = "0x08000037dababf28b53c271dfe40b2f22fba43fabe531e8b959c133dde3ec30037ecaf"
const mnemonic = "bird theory lounge increase minor clock liquid attitude bubble analyst science reunion"

const logicDriver = await gettingLogicDriver(
  logicId,
  mnemonic,
  "m/44'/6174'/7020'/0/0"
)

async function gettingLogicDriver(logicId, mnemonic, accountPath) {
  const provider = new VoyageProvider("babylon")
  const wallet = new Wallet(provider)
  await wallet.fromMnemonic(mnemonic, accountPath)
  return await getLogicDriver(logicId, wallet)
}

function App() {
  const [todoName, setTodoName] = useState("");
  const [todos, setTodos] = useState([]);

  // Loaders
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [marking, setMarking] = useState(false);
  const [canDelete, setCanDelete] = useState(true);

  useEffect(() => {
    getTodos();
  }, []);

  const handleTodoName = (e) => {
    setTodoName(e.currentTarget.value);
  };

  const getTodos = async () => {
    try {
      const tTodos = await logicDriver.persistentState.get("todos")
      setTodos(tTodos)
      setLoading(false);
    } catch (error) {
      setLoading(false)
      console.log(error);
    }
  };

  const add = async (e) => {
    e.preventDefault();
    try {
      setAdding(true);
      info("Adding Todo ...");

      const ix = await logicDriver.routines.Add([todoName]).send({
        fuelPrice: 1,
        fuelLimit: 1000,
      });
      await ix.wait();
      await getTodos();

      success("Successfully Added");
      setTodoName("");
      setAdding(false);
    } catch (error) {
      console.log(error);
    }
  };

  const markCompleted = async (id) => {
    try {
      setMarking(id)
      const ix = await logicDriver.routines.MarkTodoCompleted([id]).send({
        fuelPrice: 1,
        fuelLimit: 1000,
      });
  
      await ix.wait();
      
      const tTodos = [...todos];
      tTodos[id].completed = true;
      setTodos(tTodos);
      setMarking(false)
    } catch (error) {
      console.log(error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      const updatedTodos = todos.filter((todo, index) => index !== id);
      setTodos(updatedTodos);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="background">
      <Toaster />
      <section className="section-center">
        <form className="todo-form">
          <p className="alert"></p>
          <h3>Todo buddy</h3>
          <div className="form-control">
            <input
              value={todoName}
              name="todoName"
              onChange={handleTodoName}
              type="text"
              id="todo"
              placeholder="e.g. Attend Moi Event"
            />
            <button onClick={add} type="submit" className="text-completed">
              {adding ? <Loader color={"#000"} loading={adding} /> : "Add Todo"}
            </button>
          </div>
        </form>
        {!loading ? (
          <div className="todo-container show-container">
            {todos.map((todo, index) => (
              <div className="todo-list" key={index}>
                {todo.name}
                {todo.completed && canDelete ? (
                  <img className="icon" src="/images/check.svg" alt="check mark" />
                ) : (
                  <>
                    <span
                      onClick={() => markCompleted(index)}
                      className="underline text-red pointer"
                    >
                      {marking === index ? (
                        <Loader color={"#000"} loading={marking === 0 ? true : marking} />
                      ) : (
                        "Completed!"
                      )}
                    </span>
                    {canDelete && (
                      <button
                        onClick={() => deleteTodo(index)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ marginTop: "20px" }}>
            <Loader color={"#000"} loading={loading} />
          </div>
        )}
      </section>
    </div>
  );
}

export default App;

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type StorageContextType<T> = {
  data: T;
  setData: (value: T) => void;
  updateData: (value: Partial<T>) => void;
  clearData: () => void;
};

function createStorageContext<T extends object | null>(
  storageKey: string,
  initialValue: T
) {
  const Context = createContext<StorageContextType<T> | null>(null);

  function Provider({ children }: { children: ReactNode }) {
    const [data, setDataState] = useState<T>(() => {
      try {
        const stored = localStorage.getItem(storageKey);

        return stored ? JSON.parse(stored) : initialValue;
      } catch {
        return initialValue;
      }
    });

    useEffect(() => {
      localStorage.setItem(storageKey, JSON.stringify(data));
    }, [data]);

    const setData = (value: T) => {
      setDataState(value);
    };

    const updateData = (value: Partial<T>) => {
      setDataState((prev) => ({
        ...prev,
        ...value,
      }));
    };

    const clearData = () => {
      setDataState(initialValue);
      localStorage.removeItem(storageKey);
    };

    return (
      <Context.Provider
        value={{
          data,
          setData,
          updateData,
          clearData,
        }}
      >
        {children}
      </Context.Provider>
    );
  }

  function useStorage() {
    const context = useContext(Context);

    if (!context) {
      throw new Error(
        "useStorage must be used inside StorageProvider"
      );
    }

    return context;
  }

  return {
    Provider,
    useStorage,
  };
}

export default createStorageContext;

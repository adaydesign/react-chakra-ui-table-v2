import { Badge, ChakraProvider, Flex, HStack, Link } from "@chakra-ui/react";
import { ReactNode, useEffect, useRef, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { DataTable, getSummary } from "./lib/components/DataTable";
import { getNumformat } from "./lib";
import {
  arrayFilterFn,
  booleanFilterFn,
  dateRangeFilterFn,
  multiEnumFilterFn,
} from "./lib/utils/filters";

type TodoItem = {
  id: number;
  name: string;
  title: string;
  value: number;
  completed: boolean;
  date: Date;
  hairColor: HairColor;
  foods: string[];
  bodySize: {
    height: number;
    waist: number;
    shoulders: number;
  };
};

enum HairColor {
  BLONDE = "Blonde",
  BROWN = "Brown",
  RED = "Red",
}

const foods = ["meat", "vegan", "lactose","egg"];

// Example Component in Table
type IBadgeProps = {
  children:ReactNode
}
const HairColorBadge = ({children}:IBadgeProps) =>{
  let c = "gray"
  switch(children?.toString()){
    case HairColor.BLONDE : c = "yellow"; break;
    case HairColor.BROWN : c="orange"; break;
    case HairColor.RED : c="red"; break;
  }

  return <Badge colorScheme={c} size="sm">{children}</Badge>
}

const FoodBadge = ({children}:IBadgeProps)=>{
  let c = "gray"
  switch(children?.toString()){
    case "meat" : c = "orange"; break;
    case "vegan" : c="green"; break;
    case "lactose" : c="yellow"; break;
    case "egg" : c="pink"; break;
  }

  return <Badge colorScheme={c} size="sm">{children}</Badge>
}


const columnHelper = createColumnHelper<TodoItem>();
// Example Table
const TodoListTable = () => {
  const columns = [
    columnHelper.accessor("id", {
      cell: (info) => info.row.index + 1,
      header: "Order",
    }),
    columnHelper.accessor("name", {
      cell: (info) => info.getValue(),
      header: "Name",
    }),
    columnHelper.accessor("title", {
      cell: (info) => info.getValue(),
      header: "Title",
    }),
    columnHelper.accessor("value", {
      cell: (info) => info.getValue(),
      header: "Value",
      footer: ({ table }) => getNumformat(getSummary(table, "value")),
    }),
    columnHelper.accessor("completed", {
      cell: (info) => (info.getValue() ? "✅" : "❌"),
      header: "Completed",
      filterFn: booleanFilterFn,
    }),
    columnHelper.accessor("date", {
      id:"html_date",
      cell: (info) => info.getValue().toLocaleString(),
      header: "Date",
      filterFn: dateRangeFilterFn,
    }),
    columnHelper.accessor("hairColor", {
      id:"html_hairColor",
      cell: (info) => (<HairColorBadge>{info.getValue()}</HairColorBadge>),
      header: "Hair Color",
      meta: {
        columnType: "multienum",
      },
      filterFn: multiEnumFilterFn,
    }),
    columnHelper.accessor("foods", {
      id:"html_foods",
      cell: (info) => {
        const foods = info.getValue()
        return foods ? <HStack gap={1}>{foods.map(f=><FoodBadge>{f}</FoodBadge>)}</HStack>:"-";
      },
      header: "Eats",
      filterFn: arrayFilterFn,
    }),
    columnHelper.accessor("bodySize", {
      id:"html_bodySize",
      cell: (info) => info.getValue()?.height,
      enableColumnFilter: false,
      header: "Body Size",
    }),
  ];

  const [data, setData] = useState(null);

  const loadData: any = useRef();
  loadData.current = async () => {
    const urls = [
      "https://jsonplaceholder.typicode.com/users",
      "https://jsonplaceholder.typicode.com/todos",
    ];
    try {
      const result = await Promise.all(
        urls.map((url) => fetch(url).then((r) => r.json()))
      );

      const bodySize = {
        height: 180,
        waist: 120,
        shoulders: 140,
      };
      const bodySizeWithDefault = {
        height: 180,
        waist: 120,
        shoulders: 140,
        default: 222,
      };

      if (result.length === 2) {
        // index 0 is user
        // index 1 is todo
        const todoList = result[1].map((todo: any, index: number) => {
          todo.user = result[0].find((i: any) => i.id === todo.userId);
          todo.name = todo.user?.name;
          todo.value = Math.floor(Math.random() * 100); // floor to have some 0s

          const firstDayJanuary2024UnixTime = 1704063600000;
          const lastDayMay2024UnixTime = 1717192799000;
          const randomUnixTime =
            Math.floor(
              (lastDayMay2024UnixTime - firstDayJanuary2024UnixTime) *
                Math.random()
            ) + firstDayJanuary2024UnixTime;
          todo.date = new Date(randomUnixTime);

          switch (index % 4) {
            case 0:
              todo.hairColor = HairColor.BLONDE;
              todo.bodySize = bodySize;
              break;

            case 1:
              todo.hairColor = HairColor.BROWN;
              todo.bodySize = bodySizeWithDefault;
              break;

            case 2:
              todo.hairColor = HairColor.RED;
              todo.bodySize = null;
              break;

            default:
              todo.hairColor = HairColor.RED;
              //todo.foods = [];
              break;
          }

          // random food
          const fCount = Math.floor(Math.random()*3)+1
          const fList = []
          let fCopy = [...foods]
          for(let i=0; i<fCount; i++){
            const fdId = Math.floor(Math.random()*fCopy.length)
            fList.push(fCopy[fdId])
            fCopy = fCopy.filter(v=>v!=fCopy[fdId])
          } 
          todo.foods = fList

          return todo;
        });

        setData(todoList);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    if (loadData.current) {
      loadData.current();
    }

    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => {
      clearTimeout(loadingTimeout);
    };
  }, []);

  return (
    data && (
      <DataTable
        columns={columns}
        data={data}
        title="Example Table by React Chakra UI Table v.2.1"
        isLoading={isLoading}
        initialSortingState={[{ id: "name", desc: true }]}
        filterIsOpen={true}
      />
    )
  );
};

function App() {
  return (
    <ChakraProvider>
      <Flex w="full" p={6} direction="column">
        <Flex w="Full" justify="end">
          <Link
            href="https://github.com/adaydesign/react-chakra-ui-table-v2"
            isExternal
          >
            <svg
              height="24"
              aria-hidden="true"
              viewBox="0 0 16 16"
              version="1.1"
              width="24"
              data-view-component="true"
            >
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
            </svg>
          </Link>
        </Flex>
        <TodoListTable />
      </Flex>
    </ChakraProvider>
  );
}

export default App;

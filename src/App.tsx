import { ChakraProvider, Flex } from "@chakra-ui/react"
import { DataTable } from "./lib/components"
import { useEffect, useRef, useState } from "react"
import { createColumnHelper } from "@tanstack/react-table"
import { getNumformat } from "./lib/utils/formatters"
import { getSummary } from "./lib/components/DataTable"

type TodoItem = {
  id: number
  name: string
  title: string
  value: number
  completed: boolean
}

const columnHelper = createColumnHelper<TodoItem>()
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
      footer: ({ table }) => getNumformat(getSummary(table, 'value')),
    }),
    columnHelper.accessor("completed", {
      cell: (info) => (info.getValue() ? "✅" : "❌"),
      header: "Completed",
    }),
  ]

  const [data, setData] = useState(null)

  const loadData: any = useRef()
  loadData.current = async () => {
    const urls = [
      "https://jsonplaceholder.typicode.com/users",
      "https://jsonplaceholder.typicode.com/todos",
    ]
    try {
      const result = await Promise.all(
        urls.map((url) => fetch(url).then((r) => r.json()))
      )

      if (result.length === 2) {
        // index 0 is user
        // index 1 is todo
        const todoList = result[1].map((todo: any) => {
          todo.user = result[0].find((i: any) => i.id === todo.userId)
          todo.name = todo.user?.name
          todo.value = Math.round(Math.random() * 100)
          return todo
        })

        setData(todoList)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (loadData.current) {
      loadData.current()
    }
  }, [])

  return data && <DataTable columns={columns} data={data} title="Example Table by React Chakra UI Table v.2"/>
}

function App() {
  return (
    <ChakraProvider>
      <Flex w="full" p={6}>
        <TodoListTable />
      </Flex>
    </ChakraProvider>
  )
}

export default App

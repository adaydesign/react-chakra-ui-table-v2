# React Chakra UI Table v2

## Features

- React v.18
- Chakra UI v.2.8
- Tanstack Table V.8
- Custom Title, Columns and Data
- Custom Pagination
- Filter and Sorting in columns
- Show or Hide columns
- Export data to CSV and PDF file
- Print

## Pre Requirement Installation

### npm

Copy dependencies below to package.json

```json
"dependencies": {
    "@chakra-ui/icons": "^2.1.1",
    "@chakra-ui/react": "^2.8.1",
    "@tanstack/match-sorter-utils": "^8.11.8",
    "@tanstack/react-table": "^8.10.3",
    "export-to-csv": "^1.2.1",
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.7.1",
    "react-icons": "^4.11.0",

    (... your dependencies ...)
}
```

and then run command `npm i` to install packages

```
> npm i
```

## Install Package

```
> npm i react-chakra-ui-table-v2
```

see more : https://www.npmjs.com/package/react-chakra-ui-table-v2

## Example Code

```tsx
import { ChakraProvider, Flex, Link } from "@chakra-ui/react"
import { useEffect, useRef, useState } from "react"
import { createColumnHelper } from "@tanstack/react-table"
import { DataTable, getNumformat, getSummary } from "react-chakra-ui-table-v2"

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
      footer: ({ table }) => getNumformat(getSummary(table, "value")),
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

  return (
    data && (
      <DataTable
        columns={columns}
        data={data}
        title="Example Table by React Chakra UI Table v.2"
      />
    )
  )
}

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
  )
}

export default App
```

## Properties

```tsx
return (
  <DataTable
    columns={columns}
    data={data}
    title="Example Table by React Chakra UI Table v.2"
  />
)
```

| Property | Type                                 |
| -------- | ------------------------------------ |
| columns  | Array - create by createColumnHelper |
| data     | Array                                |
| title    | string(optional)                     |

## Functions

```ts
import {
  DataTable,
  getNumformat,
  getSummary,
  getCurrency,
} from "react-chakra-ui-table-v2"
```

| Function Name | Description                               |
| ------------- | ----------------------------------------- |
| DataTable     | Main Component                            |
| getSummary    | Util function for summary number          |
| getCurrency   | Util function for display currency format |
| getNumformat  | Util function for display number format   |

## Demo

web demo : https://chakra-table-v2.netlify.app/

## Demo Screenshot

![Screenshot](https://raw.githubusercontent.com/adaydesign/react-chakra-ui-table-v2/main/public/demo.png)

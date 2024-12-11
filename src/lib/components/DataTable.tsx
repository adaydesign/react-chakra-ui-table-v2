import {
  Table as CKTable,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tfoot,
  HStack,
  Button,
  Select,
  Text,
  Input,
  Spacer,
  Flex,
  TableContainer,
  Icon,
  Checkbox,
  Divider,
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  VStack,
  UseDisclosureReturn,
  useDisclosure,
  Box,
  Spinner,
  CheckboxGroup,
  Tooltip,
} from "@chakra-ui/react";
import {
  ArrowBackIcon,
  ArrowForwardIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HamburgerIcon,
  Search2Icon,
  SearchIcon,
  TriangleDownIcon,
  TriangleUpIcon,
  WarningTwoIcon,
} from "@chakra-ui/icons";
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  ColumnDef,
  SortingState,
  getSortedRowModel,
  getPaginationRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  ColumnFiltersState,
  Table as RETable,
  Column,
  getFilteredRowModel,
  VisibilityState,
} from "@tanstack/react-table";
import { GoFilter, GoInbox, GoLinkExternal, GoTasklist } from "react-icons/go";
import {
  FaFileCsv,
  FaPrint,
  FaRegFilePdf,
  FaTrash,
  FaRegFileExcel,
} from "react-icons/fa6";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { mkConfig, generateCsv, download } from "export-to-csv";
import XLSX from "xlsx";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { getNumformat } from "../utils/formatters";
import { SingleDatepicker } from "chakra-dayzed-datepicker";
import ReactDOMServer from "react-dom/server";

export const DEFAULT_PAGES = [10, 20, 50, 100] as const;
export type PageSize = (typeof DEFAULT_PAGES)[number];

export const NoDataDisplay = () => {
  return (
    <Flex
      direction="column"
      p={4}
      align="center"
      justify="center"
      bgColor="gray.100"
    >
      <Icon as={GoInbox} boxSize="70px" mb={3} color="gray.400" />
      <Text>No Data</Text>
    </Flex>
  );
};

export const LoadingDataDisplay = () => {
  return (
    <Flex
      direction="column"
      p={4}
      align="center"
      justify="center"
      bgColor="gray.100"
    >
      <Spinner
        size="xl"
        boxSize="70px"
        thickness="0.25rem"
        mb={3}
        color="gray.400"
      />
      <Text>Loading Data</Text>
    </Flex>
  );
};

export const ErrorDisplay = ({ message }: { message: string }) => {
  const DEFAULT_ERROR_MESSAGE = "Error";

  return (
    <Flex
      direction="column"
      p={4}
      align="center"
      justify="center"
      bgColor="gray.100"
    >
      <Icon as={WarningTwoIcon} boxSize="70px" mb={3} color="gray.400" />
      <Text>{message ?? DEFAULT_ERROR_MESSAGE}</Text>
    </Flex>
  );
};

export type DataTableProps<Data extends object> = {
  title?: string;
  data: Data[] | undefined;
  columns: ColumnDef<Data, any>[];
  isLoading?: boolean;
  error?: { message: string } | any;
  initialSortingState?: SortingState;
  initialColumnVisibility?: VisibilityState;
  initialColumnFilters?: ColumnFiltersState;
  initialPageSize?: PageSize;
  filterIsOpen?: boolean;
  onChangePageSize?: (newPageSize: PageSize) => void;
  onSortingChange?: (filters: SortingState) => void;
  onColumnVisibilityChange?: (filters: VisibilityState) => void;
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
};

export function DataTable<Data extends object>({
  title = "Table",
  data = [],
  columns,
  isLoading = false,
  error = undefined,
  initialSortingState = [],
  initialColumnVisibility = {},
  initialColumnFilters = [],
  initialPageSize = DEFAULT_PAGES[1],
  filterIsOpen = false,
  onChangePageSize = () => {},
  onSortingChange,
  onColumnVisibilityChange,
  onColumnFiltersChange,
}: DataTableProps<Data>) {
  const [sorting, setSorting] = useState<SortingState>(initialSortingState);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialColumnVisibility
  );
  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>(initialColumnFilters);
  const filterDisclosure = useDisclosure({
    defaultIsOpen: filterIsOpen,
  });

  const table = useReactTable({
    columns,
    data: data || [],
    initialState: { pagination: { pageSize: initialPageSize } },
    autoResetPageIndex: false,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
    },
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: (newFilters) => {
      setSorting(newFilters);
      const updatedFilters =
        typeof newFilters === "function" ? newFilters(sorting) : newFilters;
      if (onSortingChange) {
        onSortingChange(updatedFilters);
      }
    },
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: (newFilters) => {
      setColumnVisibility(newFilters);
      const updatedFilters =
        typeof newFilters === "function"
          ? newFilters(columnVisibility)
          : newFilters;
      if (onColumnVisibilityChange) {
        onColumnVisibilityChange(updatedFilters);
      }
    },
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: (newFilters) => {
      setColumnFilters(newFilters);
      const updatedFilters =
        typeof newFilters === "function"
          ? newFilters(columnFilters)
          : newFilters;
      if (onColumnFiltersChange) {
        onColumnFiltersChange(updatedFilters);
      }
    },
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
  });

  const countMaxColumns = useMemo(() => {
    return Math.max(
      ...table.getHeaderGroups().map((headerGroup) => {
        return headerGroup.headers.length;
      })
    );
  }, [table]);

  return (
    <Flex direction="column" w="full">
      <TableController
        title={title}
        table={table}
        filterDisclosure={filterDisclosure}
        setColumnFilters={setColumnFilters}
      />
      <TableContainer w="full" whiteSpace="normal">
        <CKTable size="sm" variant="striped">
          <Thead>
            {table.getHeaderGroups().map((headerGroup, hgIndex) => {
              return (
                <Tr key={`header-group-${headerGroup.id}-${hgIndex}`}>
                  {headerGroup.headers.map((header, headerIndex) => {
                    const meta: any = header.column.columnDef;
                    return (
                      <Th
                        key={`header-column-${headerGroup.id}-${header.id}-${headerIndex}`}
                        isNumeric={meta?.isNumeric}
                        colSpan={header.colSpan}
                        minW={`${meta?.minSize}px`}
                      >
                        <Flex
                          direction="row"
                          justify="space-between"
                          gap="0.5rem"
                        >
                          <HStack
                            onClick={header.column.getToggleSortingHandler()}
                            cursor="pointer"
                            gap="0.5rem"
                            w="full"
                            h="2rem"
                          >
                            <Text>
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </Text>
                            <Box
                              w="1rem"
                              display="flex"
                              justifyContent="center"
                            >
                              {header.column.getIsSorted() &&
                                (header.column.getIsSorted() === "desc" ? (
                                  <TriangleDownIcon aria-label="sorted descending" />
                                ) : (
                                  <TriangleUpIcon aria-label="sorted ascending" />
                                ))}
                            </Box>
                          </HStack>
                          {!header.column.getCanFilter() ? null : (
                            <Box
                              w="1rem"
                              display="flex"
                              justifyContent="center"
                            >
                              {filterDisclosure.isOpen && (
                                <Menu closeOnSelect={false}>
                                  <MenuButton
                                    as={IconButton}
                                    icon={
                                      header.column.getFilterValue() ===
                                      undefined ? (
                                        <SearchIcon />
                                      ) : (
                                        <Search2Icon />
                                      )
                                    }
                                    isRound={true}
                                    variant="ghost"
                                    colorScheme={
                                      header.column.getFilterValue() ===
                                      undefined
                                        ? "gray"
                                        : "orange"
                                    }
                                    fontSize="1rem"
                                    aria-label="column filter"
                                    size="sm"
                                  />
                                  <MenuList p="0.5rem">
                                    <Flex
                                      w="full"
                                      direction="column"
                                      gap="0.5rem"
                                    >
                                      {header.column.getCanFilter() && (
                                        <Flex>
                                          <Filter
                                            column={header.column}
                                            table={table}
                                          />
                                        </Flex>
                                      )}
                                      <Button
                                        rightIcon={<FaTrash />}
                                        colorScheme="blue"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          header.column.setFilterValue(
                                            undefined
                                          )
                                        }
                                      >
                                        Reset
                                      </Button>
                                    </Flex>
                                  </MenuList>
                                </Menu>
                              )}
                            </Box>
                          )}
                        </Flex>
                      </Th>
                    );
                  })}
                </Tr>
              );
            })}
          </Thead>
          {isLoading ? (
            <Tbody>
              <Tr>
                <Td colSpan={countMaxColumns}>
                  <LoadingDataDisplay />
                </Td>
              </Tr>
            </Tbody>
          ) : error ? (
            <Tbody>
              <Tr>
                <Td colSpan={countMaxColumns}>
                  <ErrorDisplay message={error.message ?? undefined} />
                </Td>
              </Tr>
            </Tbody>
          ) : data == null || data == undefined || data?.length == 0 ? (
            <Tbody>
              <Tr>
                <Td colSpan={countMaxColumns}>
                  <NoDataDisplay />
                </Td>
              </Tr>
            </Tbody>
          ) : (
            data &&
            data?.length > 0 && (
              <Tbody>
                {table.getRowModel().rows?.map((row, index) => (
                  <Tr
                    key={`body-${row.id}-${index}`}
                    _hover={{ shadow: "md", bg: "blackAlpha.50" }}
                  >
                    {row.getVisibleCells().map((cell, indexCell) => {
                      return (
                        <Td
                          key={`body-cell-${row.id}-${cell.id}-${indexCell}`}
                          whiteSpace="normal"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </Td>
                      );
                    })}
                  </Tr>
                ))}
              </Tbody>
            )
          )}
          <Tfoot>
            {table.getFooterGroups().map((footerGroup: any, index: number) => (
              <Tr key={`footer-group-${footerGroup.id}-${index}`}>
                {footerGroup.headers.map((header: any, hIndex: number) => (
                  <Th
                    key={`footer-headers-${header.id}-${hIndex}`}
                    colSpan={header.colSpan}
                    whiteSpace="normal"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.footer,
                          header.getContext()
                        )}
                  </Th>
                ))}
              </Tr>
            ))}
            <Tr>
              <Td colSpan={countMaxColumns}>
                <Flex w="full">
                  <HStack>
                    <Button
                      size="sm"
                      onClick={() => table.setPageIndex(0)}
                      isDisabled={!table.getCanPreviousPage()}
                    >
                      <ArrowBackIcon />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => table.previousPage()}
                      isDisabled={!table.getCanPreviousPage()}
                    >
                      <ChevronLeftIcon />
                    </Button>
                    <HStack minW="fit-content" justify="center">
                      <Text>
                        {`Page ${
                          table.getState().pagination.pageIndex + 1
                        } / ${table.getPageCount()}`}
                      </Text>
                    </HStack>
                    <Button
                      size="sm"
                      onClick={() => table.nextPage()}
                      isDisabled={!table.getCanNextPage()}
                    >
                      <ChevronRightIcon />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        table.setPageIndex(table.getPageCount() - 1)
                      }
                      isDisabled={!table.getCanNextPage()}
                    >
                      <ArrowForwardIcon />
                    </Button>
                  </HStack>
                  <HStack ml={4}>
                    <Text minW="fit-content">Go To : </Text>
                    <Input
                      type="number"
                      defaultValue={table.getState().pagination.pageIndex + 1}
                      onChange={(e) => {
                        const page = e.target.value
                          ? Number(e.target.value) - 1
                          : 0;
                        table.setPageIndex(page);
                      }}
                      size="sm"
                    />
                  </HStack>
                  <Spacer />
                  <Flex justify="end">
                    <Select
                      minW="fit-content"
                      value={table.getState().pagination.pageSize}
                      size="sm"
                      onChange={(e) => {
                        table.setPageSize(Number(e.target.value));
                        onChangePageSize(Number(e.target.value) as PageSize);
                      }}
                    >
                      {DEFAULT_PAGES.map((pageSize, index) => (
                        <option key={`page-${index}`} value={pageSize}>
                          Show {pageSize} rows
                        </option>
                      ))}
                    </Select>
                  </Flex>
                </Flex>
              </Td>
            </Tr>
          </Tfoot>
        </CKTable>
      </TableContainer>
    </Flex>
  );
}

// Table Controller component
export type TableControllerProps<Data extends object> = {
  title: string;
  table: RETable<Data>;
  filterDisclosure: UseDisclosureReturn;
  setColumnFilters: Dispatch<SetStateAction<ColumnFiltersState>>;
};
function TableController<Data extends object>({
  title,
  table,
  filterDisclosure,
  setColumnFilters,
}: TableControllerProps<Data>) {
  function getExportFileBlob(
    columns: Column<Data, unknown>[],
    // data: Row<Data>[],
    fileType: string,
    fileName: string
  ) {
    const header = columns
      .filter((c) => c.getIsVisible())
      .map((column) => {
        return {
          id: column.id,
          name: column.columnDef?.header,
        };
      });

    const headerNames = header.map((c) => c.name);

    // CSV
    if (fileType === "csv" || fileType === "xlsx") {
      // const csvConfig = mkConfig({
      //   columnHeaders: header.map((c) => c.id),
      //   filename: fileName,
      // });

      // const csv = generateCsv(csvConfig)(rowData as any);
      // download(csvConfig)(csv);
      const exportDataCSV = table.getRowModel().rows.map((row: any) => {
        let rec: any = {};
        row.getVisibleCells().map((cell: any) => {
          let col = cell.column.id + "";
          let colName = cell.column.columnDef.header;

          if (col.startsWith("html_")) {
            const cellHtmlString = ReactDOMServer.renderToStaticMarkup(
              flexRender(
                cell.column.columnDef.cell,
                cell.getContext()
              ) as React.ReactElement
            );
            const cellPlainText = stripHtmlTags(cellHtmlString);
            return (rec[colName] = cellPlainText);
          } else {
            return (rec[colName] = cell.renderValue());
          }
        });
        return rec;
      });

      if (fileType === "csv") {
        const csvConfig = mkConfig({
          columnHeaders: headerNames,
          filename: fileName,
        } as any);

        const csv = generateCsv(csvConfig)(exportDataCSV);
        download(csvConfig)(csv);
      } else if (fileType === "xlsx") {
        let wb = XLSX.utils.book_new();
        let ws1 = XLSX.utils.json_to_sheet(exportDataCSV, {
          header: headerNames,
        } as any);
        XLSX.utils.sheet_add_aoa(ws1, [headerNames], { origin: "A1" });
        XLSX.utils.book_append_sheet(wb, ws1, "Sheet 1");
        XLSX.writeFile(wb, `${fileName}.xlsx`);
        // Returning false as downloading of file is already taken care of
        return false;
      }
    }
    // PDF
    else if (fileType === "pdf" || fileType === "pdf-print") {
      // const listData = rowData.map((d: any) => {
      //   const value: any = [];
      //   header.map((c: any) => value.push(d[c.id]));
      //   return value;
      // });
      // data
      const exportData = table.getRowModel().rows.map((row: any) => {
        return row.getVisibleCells().map((cell: any) => {
          let col = cell.column.id + "";
          if (col.startsWith("html_")) {
            const cellHtmlString = ReactDOMServer.renderToStaticMarkup(
              flexRender(
                cell.column.columnDef.cell,
                cell.getContext()
              ) as React.ReactElement
            );
            const cellPlainText = stripHtmlTags(cellHtmlString);
            return cellPlainText;
          } else {
            return cell.renderValue();
          }
        });
      });

      const unit = "pt";
      const size = "A4"; // Use A1, A2, A3 or A4
      const orientation = "landscape"; // portrait or landscape

      // const marginLeft = 40;
      const doc = new jsPDF(orientation, unit, size);

      // font
      doc.setFontSize(10);
      doc.text(title, 45, 50);
      (doc as any).autoTable({
        head: [headerNames],
        body: exportData, //listData,
        margin: { top: 70 },
        styles: {
          minCellHeight: 9,
          halign: "left",
          fontSize: 10,
          lineHeight: 1.8,
        },
        theme: "grid",
        headStyles: {
          fillColor: [166, 207, 152],
        },
      });

      if (fileType == "pdf") {
        doc.save(`${fileName}.pdf`);
      } else if (fileType == "pdf-print") {
        doc.autoPrint({ variant: "non-conform" });
        doc.output("pdfobjectnewwindow");
      }
    }

    return false;
  }

  return (
    <Flex w="full" mb={2} px={2} align="center" direction="column">
      <Flex w="full">
        <Heading fontSize="md">
          <Icon as={HamburgerIcon} mr={2} />
          {title}
        </Heading>
      </Flex>
      <Flex w="full" align="center">
        <Text color="gray.500">
          Result found{" "}
          {getNumformat(table.getPrePaginationRowModel().rows.length)} record
          {table.getPrePaginationRowModel().rows.length !== 1 && "s"}
        </Text>
        {table.getCoreRowModel().rows.length >
          table.getPrePaginationRowModel().rows.length && (
          <>
            <span style={{ paddingLeft: "0.5rem" }}></span>
            <Tooltip
              label={`${
                table.getCoreRowModel().rows.length -
                table.getPrePaginationRowModel().rows.length
              } rows hidden by filters`}
            >
              <WarningTwoIcon boxSize="1.5rem" color="yellow.400" />
            </Tooltip>
          </>
        )}
        <Spacer />
        <HStack align="center">
          {filterDisclosure && (
            <IconButton
              icon={<GoFilter />}
              variant="ghost"
              aria-label="toggle filter"
              isActive={filterDisclosure?.isOpen}
              onClick={() => {
                if (filterDisclosure.isOpen) {
                  setColumnFilters([]);
                }
                filterDisclosure.onToggle();
              }}
            />
          )}
          <Menu closeOnSelect={false}>
            <MenuButton
              as={IconButton}
              icon={<GoTasklist />}
              variant="ghost"
              aria-label="column toggle"
            />
            <MenuList>
              <Flex w="full" direction="column" p={2}>
                <HStack>
                  <Checkbox
                    isChecked={table.getIsAllColumnsVisible()}
                    onChange={table.getToggleAllColumnsVisibilityHandler()}
                  >
                    All
                  </Checkbox>
                </HStack>
                <Divider orientation="horizontal" my={1} />
                <VStack align="start">
                  {table
                    .getAllLeafColumns()
                    .map((column: any, index: number) => (
                      <Checkbox
                        key={`checkbox-${column.id}-${index}`}
                        isChecked={column.getIsVisible()}
                        onChange={column.getToggleVisibilityHandler()}
                      >
                        {column?.columnDef?.header}
                      </Checkbox>
                    ))}
                </VStack>
              </Flex>
            </MenuList>
          </Menu>
          <Menu closeOnSelect={false}>
            <MenuButton
              as={IconButton}
              icon={<GoLinkExternal />}
              variant="ghost"
              aria-label="export"
            />
            <MenuList>
              <MenuItem
                icon={<FaRegFileExcel />}
                onClick={() => {
                  getExportFileBlob(
                    table.getAllColumns(),
                    "xlsx",
                    "report-file"
                  );
                }}
              >
                Export to Excel
              </MenuItem>
              <MenuItem
                icon={<FaFileCsv />}
                onClick={() => {
                  getExportFileBlob(
                    table.getAllColumns(),
                    "csv",
                    "report-file"
                  );
                }}
              >
                Export to CSV
              </MenuItem>
              <MenuItem
                icon={<FaRegFilePdf />}
                onClick={() => {
                  getExportFileBlob(
                    table.getAllColumns(),
                    "pdf",
                    "report-file"
                  );
                }}
              >
                Export to PDF
              </MenuItem>
              <MenuItem
                icon={<FaPrint />}
                onClick={() => {
                  getExportFileBlob(
                    table.getAllColumns(),
                    // table.getPrePaginationRowModel().rows,
                    "pdf-print",
                    "report-file"
                  );
                }}
              >
                Print
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
    </Flex>
  );
}

// Filter Component
interface FilterProps {
  column: Column<any, unknown>;
  table: RETable<any>;
}
const Filter = ({ column, table }: FilterProps) => {
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id);

  const columnFilterValue = column.getFilterValue();

  const columnType = getType(firstValue);
  const facets = column?.getFacetedUniqueValues();
  // Custom facets if keys is array then sum the equal value and remove duplicate
  const customFacets = new Map();
  for (const [key, value] of facets as any) {
    if (Array.isArray(key)) {
      for (const k of key) {
        const prevValue = customFacets.get(k) || 0;
        customFacets.set(k, prevValue + value);
      }
    } else {
      const prevValue = customFacets.get(key) || 0;
      customFacets.set(key, prevValue + value);
    }
  }

  const sortedUniqueValues = useMemo(
    () =>
      columnType === "number" || columnType === "date"
        ? []
        : Array.from(customFacets.keys()).sort(),
    [customFacets]
  );

  const meta = column.columnDef.meta as { columnType: string };
  const switchEval =
    meta && meta.columnType
      ? meta.columnType.toLowerCase()
      : getType(firstValue);

  switch (switchEval) {
    case "number":
      return (
        <HStack w="full" spacing={1}>
          <Input
            type="number"
            size="sm"
            min={Number(
              column.getFacetedMinMaxValues()?.[0] !== undefined &&
                column.getFacetedMinMaxValues()?.[0] !== null
                ? column.getFacetedMinMaxValues()?.[0]
                : ""
            )}
            max={Number(
              column.getFacetedMinMaxValues()?.[1] !== undefined &&
                column.getFacetedMinMaxValues()?.[1] !== null
                ? column.getFacetedMinMaxValues()?.[1]
                : ""
            )}
            value={(columnFilterValue as [number, number])?.[0] ?? ""}
            onChange={(e) =>
              column.setFilterValue((old: [number, number]) => [
                e.target.value,
                old?.[1],
              ])
            }
            placeholder={`min ${
              column.getFacetedMinMaxValues()?.[0] !== undefined &&
              column.getFacetedMinMaxValues()?.[0] !== null
                ? `(${column.getFacetedMinMaxValues()?.[0]})`
                : ""
            }`}
          />
          <Input
            type="number"
            size="sm"
            min={Number(
              column.getFacetedMinMaxValues()?.[0] !== undefined &&
                column.getFacetedMinMaxValues()?.[0] !== null
                ? column.getFacetedMinMaxValues()?.[0]
                : ""
            )}
            max={Number(
              column.getFacetedMinMaxValues()?.[1] !== undefined &&
                column.getFacetedMinMaxValues()?.[1] !== null
                ? column.getFacetedMinMaxValues()?.[1]
                : ""
            )}
            value={(columnFilterValue as [number, number])?.[1] ?? ""}
            onChange={(e) => {
              column.setFilterValue((old: [number, number]) => [
                old?.[0],
                e.target.value,
              ]);
            }}
            placeholder={`max ${
              column.getFacetedMinMaxValues()?.[1] !== undefined &&
              column.getFacetedMinMaxValues()?.[1] !== null
                ? `(${column.getFacetedMinMaxValues()?.[1]})`
                : ""
            }`}
          />
        </HStack>
      );

    case "date":
      return (
        <HStack w="full" spacing={1}>
          <SingleDatepicker
            name="start-date-input"
            date={(columnFilterValue as [Date, Date])?.[0] ?? undefined}
            onDateChange={(newStartDate) =>
              column.setFilterValue((old: [Date, Date]) => [
                newStartDate,
                old?.[1],
              ])
            }
            propsConfigs={{
              inputProps: {
                size: "sm",
                placeholder: "from...",
              },
            }}
            configs={{
              dateFormat: "yyyy-MM-dd",
            }}
          />

          <SingleDatepicker
            name="end-date-input"
            date={(columnFilterValue as [Date, Date])?.[1] ?? undefined}
            onDateChange={(newEndDate) =>
              column.setFilterValue((old: [Date, Date]) => [
                old?.[0],
                newEndDate,
              ])
            }
            propsConfigs={{
              inputProps: {
                size: "sm",
                placeholder: "to...",
              },
            }}
            configs={{
              dateFormat: "yyyy-MM-dd",
            }}
          />
        </HStack>
      );

    case "boolean":
      return (
        <HStack w="full" spacing={1}>
          <Select
            id={column.id + "list"}
            placeholder={`select... (${customFacets.size})`}
            size="sm"
            onChange={(e) => {
              column.setFilterValue(
                !e.target.value ? undefined : e.target.value === "true"
              );
            }}
            value={
              (column.getFilterValue() as string | number) !== undefined
                ? (column.getFilterValue() as string | number)
                : ""
            }
          >
            {sortedUniqueValues.slice(0, 5000).map((value: any) => (
              <option value={value} key={value}>
                {value ? "True" : "False"}
              </option>
            ))}
          </Select>
        </HStack>
      );

    case "enum":
      return (
        <Flex w="full">
          <Select
            id={column.id + "list"}
            placeholder={`select... (${customFacets.size})`}
            size="sm"
            onChange={(e) => column.setFilterValue(e.target.value)}
            value={(column.getFilterValue() as string | number) || ""}
          >
            {sortedUniqueValues.slice(0, 5000).map((value: any) => (
              <option value={value} key={value}>
                {value}
              </option>
            ))}
          </Select>
        </Flex>
      );

    case "multienum":
      return (
        <Flex w="full">
          <CheckboxGroup
            defaultValue={sortedUniqueValues.slice(0, 5000)}
            onChange={(e) => column.setFilterValue(e)}
            value={
              (column.getFilterValue() ||
                sortedUniqueValues.slice(0, 5000)) as string[]
            }
          >
            <VStack align="start">
              {sortedUniqueValues.slice(0, 5000).map((value: any) => (
                <Checkbox value={value} key={value}>
                  {value}
                </Checkbox>
              ))}
            </VStack>
          </CheckboxGroup>
        </Flex>
      );

    case "array":
      return (
        <Flex w="full">
          <CheckboxGroup
            defaultValue={sortedUniqueValues.slice(0, 5000)}
            onChange={(e) => column.setFilterValue(e)}
            value={
              (column.getFilterValue() ||
                sortedUniqueValues.slice(0, 5000)) as string[]
            }
          >
            <VStack align="start">
              {sortedUniqueValues.slice(0, 5000).map((value: any) => (
                <Checkbox value={value} key={value}>
                  {value}
                </Checkbox>
              ))}
            </VStack>
          </CheckboxGroup>
        </Flex>
      );

    case "string":
      return (
        <Flex w="full">
          <Input
            type="text"
            size="sm"
            value={(columnFilterValue ?? "") as string}
            onChange={(e) => column.setFilterValue(e.target.value)}
            placeholder={`find...`}
            list={column.id + "list"}
          />
        </Flex>
      );

    default:
      return (
        <Flex w="full">
          <Input
            type="text"
            size="sm"
            value={(columnFilterValue ?? "") as string}
            onChange={(e) => column.setFilterValue(e.target.value)}
            placeholder={`find...`}
            list={column.id + "list"}
          />
        </Flex>
      );
  }
};

export type ColumnType =
  | "string"
  | "number"
  | "boolean"
  | "undefined"
  | "function"
  | "object"
  | "date"
  | "array"
  | "null"
  | "unknown";

function getType(variable: any): ColumnType {
  if (variable === null) {
    return "null";
  }

  switch (typeof variable) {
    case "string":
      return "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "undefined":
      return "undefined";
    case "function":
      return "function";
    case "object":
      if (variable instanceof Date) {
        return "date";
      }
      if (Array.isArray(variable)) {
        return "array";
      }
      return "object";
    default:
      return "unknown";
  }
}

// summary column
export const getSummary = (table: RETable<any>, field: string) => {
  const sum = table
    .getFilteredRowModel()
    .rows.reduce((total: any, row: any) => total + row.getValue(field), 0);
  return sum || 0;
};

// Utility function to remove HTML tags
const stripHtmlTags = (htmlString: string) => {
  return htmlString.replace(/<[^>]+>/g, "");
};

import ContentCard from "@/components/content-card";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWindowWidth } from "@/hooks/useWindowWidth";
import React, { useCallback, useEffect, useState } from "react";
import { PiExportBold } from "react-icons/pi";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ImSearch } from "react-icons/im";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { Consumption } from "@/models/consumption.model";
import * as XLSX from "xlsx";

interface CustomTooltipData {
  name: string;
  value: number;
  unit: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: CustomTooltipData[];
}

export interface FormateConsumption {
  name: string;
  averageEnergyConsumptionKWh: number;
  numberOfInvoices: number;
  totalCompensatedEnergyKWh: number;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload) {
    return null;
  }

  // const formattedValue = payload[0].value > 1000 ? formatNumber(payload[0].value) : payload[0].value;

  const formattedValue = (value: number) => {
    if (value > 1000) {
      return formatNumber(value);
    } else {
      return value;
    }
  };

  return (
    <div className="custom-tooltip">
      <h2 className="font-inter text-4xl font-[400]">{`${formattedValue(
        payload[0].value,
      )}`}</h2>
      <h2 className="font-inter text-4xl font-[400] text-[#f67e7e]">{`${formattedValue(
        payload[1].value,
      )}`}</h2>
    </div>
  );
};

const formatNumber = (value: number) => {
  return value.toLocaleString("en-US", { minimumFractionDigits: 0 });
};

const TotalEnergyConsumptionChart = () => {
  const width = useWindowWidth();
  const [searchValue, setSearchValue] = useState("");
  const [years, setYears] = useState<number[]>([]);
  const [year, setYear] = useState(
    JSON.stringify(new Date().getFullYear() - 1),
  );
  const [consumptionData, setConsumptionData] = useState<FormateConsumption[]>(
    [],
  );

  const debounce = <T extends (...args: string[]) => void>(
    cb: T,
    delay: number = 1000,
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: Parameters<T>) => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        timeout = null;
        cb(...args);
      }, delay);
    };
  };

  const onInput = (searchValue: string): void => {
    setSearchValue(searchValue);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onInputWithDebouncing = useCallback(debounce(onInput, 1000), []);

  function mapData(data: Consumption[]): FormateConsumption[] {
    return data.map((item) => ({
      name: item.referenceMonth.split("/")[0],
      averageEnergyConsumptionKWh: item.averageEnergyConsumptionKWh,
      numberOfInvoices: item.numberOfInvoices,
      totalCompensatedEnergyKWh: item.totalCompensatedEnergyKWh,
    }));
  }

  const handleClickDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(consumptionData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, `consumo-energia.xlsx`);
  };

  const getYears = () => {
    const currentYear = new Date().getFullYear();
    const lasterYears = [currentYear - 2, currentYear - 1, currentYear];
    const nextYears = [currentYear + 1, currentYear + 2, currentYear + 3];
    setYears([...lasterYears, ...nextYears]);
  };

  const getTotalEnergyConsumption = useCallback(() => {
    console.log(year, searchValue);
    api
      .get(
        `/energy-consumption-metrics?year=${year}&clientNumber=${searchValue}`,
      )
      .then((response) => {
        setConsumptionData(mapData(response.data));
      });
  }, [year, searchValue]);

  useEffect(() => {
    getYears();
    getTotalEnergyConsumption();
  }, [getTotalEnergyConsumption]);

  return (
    <ContentCard>
      <CardHeader className="mb-3 px-0 tablet:px-6 laptop:mb-0">
        <div className="flex flex-col items-start gap-5 laptop:flex-row laptop:items-center laptop:gap-10">
          <CardTitle className="font-inter text-2xl font-semibold text-zinc-900">
            Total de energia consumida (kWh)
          </CardTitle>

          <div className="mt-0 hidden h-5 w-[2px] bg-gray-400 laptop:block" />

          <div className="flex flex-wrap items-center gap-3 laptop:gap-7">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-zinc-900" />
              <h2 className="font-inter text-lg font-[400] text-zinc-900">
                Consumo de energia
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-400" />
              <h2 className="font-inter text-lg font-[400] text-zinc-900">
                Energia compensada
              </h2>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 pb-3 pt-5 tablet:flex-row tablet:items-center tablet:gap-0">
          <div className="flex w-full flex-col items-start gap-4 tablet:w-auto tablet:flex-row tablet:items-center">
            <div className="relative w-full">
              <Input
                type={"text"}
                onChange={(e) => onInputWithDebouncing(e.target.value)}
                className={`w-[250px] rounded-lg border-gray-200 bg-white pl-11 font-manrope text-sm font-medium text-gray-800 focus:border-gray-600`}
                placeholder="Pesquise pelo Nº do cliente"
              />
              <div className="absolute left-4 top-[50%] translate-y-[-50%]">
                <ImSearch className="text-zinc-900" size={16} />
              </div>
            </div>

            <Select onValueChange={setYear} defaultValue={year}>
              <SelectTrigger className="w-[100px] border-[1px] border-gray-300 text-[#1C1C1C] outline-none">
                <SelectValue placeholder="Select a fruit" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant={"outline"}
            onClick={handleClickDownload}
            className="gap-2 border-gray-200 font-manrope"
          >
            <PiExportBold size={20} />
            Exportar
          </Button>
        </div>
      </CardHeader>

      <CardContent className="overflow-x-auto px-0 pb-0 tablet:px-6 [&::-webkit-scrollbar]:hidden">
        <div className="w-[650px] tablet:w-full">
          <ResponsiveContainer width={"100%"} height={350}>
            <LineChart
              width={500}
              height={300}
              data={consumptionData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <YAxis
                padding={{ bottom: 45 }}
                axisLine={false}
                tickLine={false}
                tickCount={4}
                tickFormatter={(value) =>
                  value !== 0 && value >= 1000 ? `${value}K` : `${value}`
                }
                tick={{
                  fontSize: width < 640 ? 15 : 18,
                  fontWeight: "400",
                  fontFamily: "Inter",
                }}
              />
              <XAxis
                padding={{ left: 35 }}
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: width < 640 ? 15 : 18,
                  fontWeight: "400",
                  fontFamily: "Inter",
                }}
              />
              {/* <Tooltip contentStyle={{ backgroundColor: "transparent", border: "none" }}/> */}
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="averageEnergyConsumptionKWh"
                stroke="#1C1C1C"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="totalCompensatedEnergyKWh"
                dot={false}
                stroke="#f67e7e"
                strokeDasharray="5 5"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </ContentCard>
  );
};

export default TotalEnergyConsumptionChart;
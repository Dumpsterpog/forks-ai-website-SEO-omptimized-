// Unit tables and conversion for the unit converter. Pure arithmetic, no
// lookup service and no dependency: every factor below is the internationally
// agreed definition, so the conversions are exact and any rounding happens
// only when the number is printed.

// Length, weight and area all share a zero, so each unit is a single factor
// against a base unit and converting is one multiply and one divide.
const LENGTH_UNITS = [
  { id: "mm", name: "Millimetre", symbol: "mm", factor: 0.001 },
  { id: "cm", name: "Centimetre", symbol: "cm", factor: 0.01 },
  { id: "m", name: "Metre", symbol: "m", factor: 1 },
  { id: "km", name: "Kilometre", symbol: "km", factor: 1000 },
  { id: "in", name: "Inch", symbol: "in", factor: 0.0254 },
  { id: "ft", name: "Foot", symbol: "ft", factor: 0.3048 },
  { id: "yd", name: "Yard", symbol: "yd", factor: 0.9144 },
  { id: "mi", name: "Mile", symbol: "mi", factor: 1609.344 },
];

const WEIGHT_UNITS = [
  { id: "mg", name: "Milligram", symbol: "mg", factor: 0.000001 },
  { id: "g", name: "Gram", symbol: "g", factor: 0.001 },
  { id: "kg", name: "Kilogram", symbol: "kg", factor: 1 },
  { id: "t", name: "Metric tonne", symbol: "t", factor: 1000 },
  { id: "oz", name: "Ounce", symbol: "oz", factor: 0.028349523125 },
  { id: "lb", name: "Pound", symbol: "lb", factor: 0.45359237 },
  { id: "st", name: "Stone", symbol: "st", factor: 6.35029318 },
];

// Every area factor is the square of the matching length factor, which is why
// a square foot is 0.09290304 and not 0.3048.
const AREA_UNITS = [
  { id: "mm2", name: "Square millimetre", symbol: "mm2", factor: 0.000001 },
  { id: "cm2", name: "Square centimetre", symbol: "cm2", factor: 0.0001 },
  { id: "m2", name: "Square metre", symbol: "m2", factor: 1 },
  { id: "ha", name: "Hectare", symbol: "ha", factor: 10000 },
  { id: "km2", name: "Square kilometre", symbol: "km2", factor: 1000000 },
  { id: "in2", name: "Square inch", symbol: "in2", factor: 0.00064516 },
  { id: "ft2", name: "Square foot", symbol: "ft2", factor: 0.09290304 },
  { id: "yd2", name: "Square yard", symbol: "yd2", factor: 0.83612736 },
  { id: "ac", name: "Acre", symbol: "ac", factor: 4046.8564224 },
  { id: "mi2", name: "Square mile", symbol: "mi2", factor: 2589988.110336 },
];

// Temperature is the odd one out: the scales have different zero points, so a
// factor alone cannot do it. Each unit declares how to reach Celsius and how
// to come back, and everything routes through Celsius.
const TEMPERATURE_UNITS = [
  {
    id: "c",
    name: "Celsius",
    symbol: "C",
    toCelsius: (v) => v,
    fromCelsius: (v) => v,
  },
  {
    id: "f",
    name: "Fahrenheit",
    symbol: "F",
    toCelsius: (v) => ((v - 32) * 5) / 9,
    fromCelsius: (v) => (v * 9) / 5 + 32,
  },
  {
    id: "k",
    name: "Kelvin",
    symbol: "K",
    toCelsius: (v) => v - 273.15,
    fromCelsius: (v) => v + 273.15,
  },
];

export const UNIT_CATEGORIES = [
  {
    id: "length",
    name: "Length",
    base: "metres",
    units: LENGTH_UNITS,
    defaultFrom: "cm",
    defaultTo: "in",
    defaultValue: "100",
  },
  {
    id: "weight",
    name: "Weight",
    base: "kilograms",
    units: WEIGHT_UNITS,
    defaultFrom: "kg",
    defaultTo: "lb",
    defaultValue: "70",
  },
  {
    id: "temperature",
    name: "Temperature",
    base: "degrees Celsius",
    units: TEMPERATURE_UNITS,
    offsets: true,
    defaultFrom: "c",
    defaultTo: "f",
    defaultValue: "37",
  },
  {
    id: "area",
    name: "Area",
    base: "square metres",
    units: AREA_UNITS,
    defaultFrom: "m2",
    defaultTo: "ft2",
    defaultValue: "50",
  },
];

export function getCategory(id) {
  return UNIT_CATEGORIES.find((category) => category.id === id) || UNIT_CATEGORIES[0];
}

export function getUnit(category, id) {
  return category.units.find((unit) => unit.id === id) || category.units[0];
}

/**
 * Convert one value between two units of the same category.
 *
 * Scale units go through the category's base unit. Temperature goes through
 * Celsius, because the offsets mean the two steps cannot be collapsed into a
 * single multiplication.
 */
export function convertUnit(value, fromUnit, toUnit) {
  if (!Number.isFinite(value)) return NaN;
  if (fromUnit.toCelsius && toUnit.fromCelsius) {
    return toUnit.fromCelsius(fromUnit.toCelsius(value));
  }
  return (value * fromUnit.factor) / toUnit.factor;
}

// The full table for one input value, so the answer you did not ask for is
// still on screen.
export function convertToAll(value, category, fromUnit) {
  return category.units.map((unit) => ({
    unit,
    value: convertUnit(value, fromUnit, unit),
  }));
}

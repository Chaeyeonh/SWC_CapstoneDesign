export function useToggle() {
  return function toggle(
    list: string[],
    value: string,
    setter: (v: string[]) => void
  ) {
    if (list.includes(value)) {
      setter(list.filter((x) => x !== value));
    } else {
      setter([...list, value]);
    }
  };
}

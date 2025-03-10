
import { InputKey } from "types/atom";
import useStakeInput from "./useStakingInput";

function useInput( subKey: InputKey) {
  const { inputValue, value, setValue, resetValue } = useStakeInput(subKey);

  return {
    inputValue,
    value,
    setValue,
    setResetValue: resetValue,
  };
}
export default useInput;

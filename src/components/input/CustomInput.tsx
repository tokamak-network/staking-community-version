import { InputGroup, useColorMode, NumberInput, Text, NumberInputField, Button, Flex, useTheme, Input } from '@chakra-ui/react';
import { inputState } from 'recoil/input';
import React from 'react';
import { useRecoilState } from 'recoil';

type InputProp = {
  placeHolder?: string;
  w?: number | string;
  h?: number | string;
  value?: string | number;
  isError?: boolean;
  maxValue?: any;
  type?: string;
  index?: string;
};

const addComma = (inputVal: any) => {
  const _val = inputVal;
  const checkInputVal = () => {
    if (_val) {
      const floatLen = _val.split('.')[1]?.length;
      if (floatLen) {
        return floatLen > 18 ? _val.slice(0, -1) : _val;
      }
      if (_val.split('.').length > 2) {
        return;
      }
      if (_val.split('.')[0]?.length > 1 && _val.split('.')[0]?.substring(0, 1) === '0') {
        return _val.split('.')[0].substring(1);
      }
      if (_val === '.') {
        return _val;
      } else {
        return _val.replace(/[^0-9a-zA-Z.]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }
    }
    return '';
  };

  return checkInputVal();
};

function BalanceInput(props: InputProp) {
  const { placeHolder, h, isError, maxValue, type, w } = props;

  const [value, setValue] = useRecoilState(inputState);
  const theme = useTheme()
  const {INPUT_STYLE} = theme

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const { value: inputValue } = target;
    setValue(addComma(inputValue));
  };

  const getButtonPosition = () => {
    if (!value || value.length <= 5) return "76px";
    
    const charWidth = 17;
    const maxChars = 20;
    const basePos = 76;
    const charsToConsider = Math.min(value.length - 5, maxChars);
    
    return `${basePos + (charsToConsider * charWidth)}px`;
  };
  
  return (
    <Flex alignItems="center" position="relative" w="100%" justifyContent="flex-start">
      <NumberInput
        isInvalid={isError}
        w="auto"
        h={h || 45}
        focusBorderColor={'#fff'}
        borderRadius={'4px'}
        value={addComma(value)}
        position="relative"
      >
        <NumberInputField
          fontSize={'30px'}
          fontWeight={600}
          color="gray.400"
          border="none"
          p={0}
          pl={0}
          textAlign="left"
          _placeholder={{
            color: '#C6CBD9',
            fontWeight: 600
          }}
          placeholder={placeHolder}
          onChange={onChange}
          width="auto"
        />
      </NumberInput>
      
      <Button
        position="absolute"
        left={getButtonPosition()}
        bottom={'35%'}
        w={'43px'}
        h={'20px'}
        border={'1px solid #dfe4ee'}
        borderRadius={'4px'}
        bgColor={'#fff'}
        fontSize={'12px'}
        fontWeight={'normal'}
        color={'#86929d'}
        zIndex={1}
        onClick={() => {
          setValue(String(maxValue));
        }}
      >
        MAX
      </Button>
    </Flex>
  );
}

export { BalanceInput };
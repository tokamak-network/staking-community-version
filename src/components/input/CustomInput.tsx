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
  const { colorMode } = useColorMode();
  const [value, setValue] = useRecoilState(inputState);
  const theme = useTheme()
  const {INPUT_STYLE} = theme

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const { value: inputValue } = target;
    setValue(addComma(inputValue));
  };
  
  return (
    <InputGroup alignItems={'center'}>
      <Flex justifyContent={'center'} >
        <NumberInput
          isInvalid={isError}
          w={'150px'}
          h={h || 45}
          focusBorderColor={'#fff'}
          // border={type === 'staking' || type === 'unstaking' ? 'none' : '1px solid #dfe4ee'}
          borderRadius={'4px'}
          value={addComma(value)}
          // ml={type==='staking' || type === 'unstaking' ? '65px' : ''}
        >
          {/* <Flex flexDir={type === 'staking' ? 'column' : 'row'} alignItems={'center'} justifyContent={'center'}> */}
            <NumberInputField
              fontSize={'30px'}
              // height:'100%',
              borderRadius={0}
              textAlign={'center'}
              overflow={'auto'}
              fontWeight={600}
              _placeholder={{
                color: '#C6CBD9' 
              }}  
              border={''}
              m={0}
              placeholder={placeHolder}
              onChange={onChange}
            /> 
          {/* </Flex> */}
        </NumberInput>
      </Flex>
      <Flex justifyContent={'center'} alignItems={'center'}>
        <Button
          zIndex={100}
          w={'43px'}
          h={'20px'}
          border={'1px solid #dfe4ee'}
          borderRadius={'4px'}
          bgColor={'#fff'}
          fontSize={'12px'}
          fontWeight={'normal'}
          color={'#86929d'}
          onClick={() => {
            setValue(String(maxValue));
          }}
        >
          Max
        </Button>
      </Flex>
    </InputGroup>
  );
}

export { BalanceInput };

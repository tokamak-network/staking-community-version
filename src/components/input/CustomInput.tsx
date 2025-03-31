import { InputGroup, useColorMode, NumberInput, Text, NumberInputField, Button, Flex, useTheme, Input } from '@chakra-ui/react';
import { calculatorInputState, inputState } from 'recoil/input';
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
  const [calculatorValue, setCalculatorValue] = useRecoilState(calculatorInputState);
  const theme = useTheme()
  const {INPUT_STYLE} = theme

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const { value: inputValue } = target;
    type === 'staking' 
    ? setValue(addComma(inputValue))
    : setCalculatorValue(addComma(inputValue))
  };

  const getButtonPosition = () => {
    if (!value || value.length <= 5) return "76px";
    
    const charWidth = 17;
    const maxChars = 20;
    const basePos = 76;
    const charsToConsider = Math.min(value.length - 5, maxChars);
    
    return `${basePos + (charsToConsider * charWidth)}px`;
  };

  const inputStaking = () => ({
    fontSize:'32px',
    height:'100%',
    borderRadius: 0,
    textAlign:'center',
    overflow:'auto',
    fontWeight:600,
    _placeholder:{ color: '#304156' },
    border: '',
    ml:'15px',
  })

  const inputUnstaking = () => ({
    fontSize:'18px',
    height:'100%',
    borderRadius: 0,
    textAlign:'right',
    overflow:'auto',
    fontWeight: 'bold',
    _placeholder:{ color: '#c6cbd9' },
    border: '',
    // ml:'15px',
  })
  const inputCalc = () => ({
    fontSize:'13px',
    fontWeight: 'normal',
    height: '28px',
    border: 'none',
    textAlign: 'right',
    color: '#3e495c',
    _placeholder:{ color: '#86929d' },
    padding: '0px',
    width: '70px',
    marginLeft: '5px',
    marginTop: '1px',
  })

  const maxStaking = () => ({
    // pos: 'absolute',
    // right:'-60px',
    w:'50px',
    h:'26px',
    mt:'10px',
    bg:'none',
    fontSize:'12px',
    color:'#2a72e5',
    fontWeight:'normal',
    cursor:'pointer',
    border: '1px solid #2a72e5',
    _hover:{
      border: '1px solid #2a72e5',
    },
  })
  const maxCalc = () => ({
    h: '32px',
    w: '56px',
    ml: '5px',
    border: '1px solid #dfe4ee',
    _hover:{
      border: '1px solid #dfe4ee',
    },
    bg:'none',
    fontSize: '12px',
    fontWeight: 'normal',
    color: '#86929d',
  })
  
  return (
    <Flex alignItems="center" position="relative" w="100%" justifyContent="flex-start">
      <NumberInput
        isInvalid={isError}
        w={type === 'staking' ? "auto" : '118px'}
        h={h || 45}
        focusBorderColor={'#fff'}
        borderRadius={'4px'}
        value={addComma(type === 'staking' ? value : calculatorValue)}
        position="relative"
        border={type === 'staking' || type === 'unstaking' ? 'none' : '1px solid #dfe4ee'}
        mr={'5px'}
      >
        <Flex>
          <NumberInputField
            // fontSize={'30px'}
            // fontWeight={600}
            color="gray.400"
            // border="none"
            p={0}
            pl={0}
            {...(
              type === 'staking' ? 
              {...inputStaking()} : 
              type === 'unstaking' ?
              {...inputUnstaking()} :
              {...inputCalc()}
            )}
            textAlign="left"
            _placeholder={{
              color: '#C6CBD9',
              fontWeight: 600
            }}
            placeholder={placeHolder}
            onChange={onChange}
            width="auto"
          />
          {
              type === 'staking' ? 
              '' :
              <Text
                fontSize={'13px'}
                fontWeight={'normal'}
                mr={'10px'}
                ml={'7px'}
                mt={'5px'}
              >
                TON
              </Text>
            }
          </Flex>
        </NumberInput>
      <Button
        position={type === 'staking' ? "absolute" : 'relative'}
        left={type === 'staking' ? getButtonPosition() : ''}
        bottom={type === 'staking' ? '35%' : ''}
        w={'43px'}
        h={'20px'}
        border={'1px solid #dfe4ee'}
        borderRadius={'4px'}
        bgColor={'#fff'}
        fontSize={'12px'}
        fontWeight={'normal'}
        // {...(type === 'staking' || type === 'unstaking' ? {...maxStaking()}: {...maxCalc()})}
        color={'#86929d'}
        zIndex={1}
        onClick={() => {
          type === 'staking'
          ? setValue(String(maxValue))
          : setCalculatorValue(String(maxValue))
        }}
      >
        MAX
      </Button>
    </Flex>
  );
}

export { BalanceInput };
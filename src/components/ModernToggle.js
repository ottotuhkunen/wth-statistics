import React from 'react';
import styled from 'styled-components';

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  user-select: none;
`;

const ToggleLabel = styled.label`
  position: relative;
  display: flex;
  align-items: center;
  width: 300px;
  height: 28px;
  font-size: 10pt;
`;

const ToggleTextLeft = styled.span`
  font-size: 10pt;
  color: white;
  width: 200px;
  text-align: right;
  margin-right: 40px;
`;

const ToggleTextRight = styled.span`
  font-size: 10pt;
  color: white; /* Ensure text color is white */
  width: 200px; /* Width for text to ensure proper alignment */
  text-align: left; /* Center-align text */
  margin-left: 40px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
`;

const Slider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 120px;
  right: 0;
  bottom: 0;
  background-color: #1a475f;
  border-radius: 34px;
  transition: .4s;
  width: 60px;
  
  &::before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    border-radius: 50%;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: .4s;
  }
`;

const ToggleSwitch = styled(ToggleInput)`
  &:checked + ${Slider} {
    background-color: #1a475f;
  }
  
  &:checked + ${Slider}::before {
    transform: translateX(32px);
  }
`;

const ModernToggle = ({ timePeriod, setTimePeriod }) => {
  const handleChange = (event) => {
    setTimePeriod(event.target.checked ? 'rolling-year' : 'all-time');
  };

  return (
    <ToggleContainer>
      <ToggleLabel>
        <ToggleTextLeft>All-Time</ToggleTextLeft>
        <ToggleSwitch
          type="checkbox"
          checked={timePeriod === 'rolling-year'}
          onChange={handleChange}
        />
        <Slider />
        <ToggleTextRight>Rolling Year</ToggleTextRight>
      </ToggleLabel>
    </ToggleContainer>
  );
};

export default ModernToggle;

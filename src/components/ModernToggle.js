import React from 'react';
import styled from 'styled-components';

const SegmentedControl = styled.div`
  position: fixed;
  right: 10px;
  top: 12px;
  z-index: 200;
  display: inline-flex;
  background-color: #1a475f;
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Option = styled.button`
  border: none;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ $active }) => ($active ? '#fff' : 'rgba(255, 255, 255, 0.7)')};
  background-color: ${({ $active }) => ($active ? '#3a86ff' : 'transparent')};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:first-child {
    margin-right: 4px;
  }

  &:hover {
    color: #fff;
    background-color: ${({ $active }) => ($active ? '#3a86ff' : 'rgba(255, 255, 255, 0.1)')};
  }
`;

const ModernSelector = ({ timePeriod, setTimePeriod }) => {
  return (
    <SegmentedControl>
      <Option
        $active={timePeriod === 'all-time'}
        onClick={() => setTimePeriod('all-time')}
      >
        All-Time
      </Option>
      <Option
        $active={timePeriod === 'rolling-year'}
        onClick={() => setTimePeriod('rolling-year')}
      >
        Rolling Year
      </Option>
    </SegmentedControl>
  );
};

export default ModernSelector;
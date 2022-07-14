import Dropdown from "react-bootstrap/Dropdown";
import styled from "styled-components";
import TypeOfHelpInput from "./TypeOfHelpInput";
import { SetStateAction, Dispatch, PropsWithChildren } from "react";
import { SearchFilters, TypeOfHelp } from "../../../types";

const DropdownButton = styled(Dropdown.Toggle)`
  border-radius: 1.5rem;
  border: none;
  background-color: #efefef;
  color: black;
  &:hover,
  &:focus {
    border: none;
    background-color: #efefef;
    color: black;
  }
  &.active {
    border: none;
    background-color: #05176c;
    color: white;
  }
`;

type ControlDropdownProps = {
  title: string;
  hasSelection: boolean;
  clearAll?: () => void;
  applyFilters: () => void;
};

function ControlDropdown({
  title,
  hasSelection,
  clearAll,
  applyFilters,
  children,
}: PropsWithChildren<ControlDropdownProps>) {
  return (
    <Dropdown className="margin-right-05 margin-top-1 ">
      <DropdownButton className={hasSelection ? "active" : ""}>
        {title}
      </DropdownButton>
      <Dropdown.Menu>
        <div className="padding-2">{children}</div>
        {clearAll && (
          <Dropdown.Item as="button" onClick={clearAll}>
            Clear all
          </Dropdown.Item>
        )}
        <Dropdown.Item as="button" onClick={applyFilters}>
          Apply
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default ControlDropdown;

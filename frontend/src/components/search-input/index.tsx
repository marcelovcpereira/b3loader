
import { Combobox, MantineProvider, TextInput, rem, ComboboxStore } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

export interface SearchInputProps {
    valuesList: string[]
    combobox: ComboboxStore
    onChangeCallback?: (str: string)=>void
    onSelectValueCallback?: (str: string) => void
}

export default function SearchInput(props: SearchInputProps) { 
    const icon = <IconSearch style={{ width: rem(16), height: rem(16) }} />;
    const handleClick = () => { 
        props.combobox.openDropdown()
    }; 
    return (
        <div id="searchInput" style={{width:"100%", display:"flex"}}>
            <MantineProvider defaultColorScheme="light">
                <Combobox
                store={props.combobox}
                width={250}
                position="bottom-start"
                withArrow
                onOptionSubmit={(val) => {
                    if (props.onSelectValueCallback != null) {
                        props.onSelectValueCallback(val)
                    }
                    props.combobox.closeDropdown();
                }}
                >
                <Combobox.Target withAriaAttributes={false}>
                    <TextInput
                        size="lg"
                        leftSectionPointerEvents="none"
                        leftSection={icon}
                        label=""
                        style={{width:"250px", height:"45px", fontSize: "100px", marginBottom: "15px"}}  
                        onChange={(e) => {
                            if (props.onChangeCallback != null) {
                                props.onChangeCallback(e.target.value)
                            }
                        }} 
                        placeholder=""
                        onClick={handleClick}
                    />
                </Combobox.Target>

                <Combobox.Dropdown>
                    <Combobox.Options>
                    {
                        props.valuesList.length > 0 ? 
                        (props.valuesList.map(value => 
                            <Combobox.Option value={value}>{value}</Combobox.Option>
                        )) 
                        : 
                        <Combobox.Empty>No stock found.</Combobox.Empty>
                    }
                    </Combobox.Options>
                </Combobox.Dropdown>
                </Combobox>
            </MantineProvider>
        </div>
    )   
}
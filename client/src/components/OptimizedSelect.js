import { FixedSizeList } from "react-window";
import { components } from "react-select";
import React from "react";

const OptimizedMenuList = (props) => {
	const { options, children, maxHeight, getValue } = props;
	if (!children || !Array.isArray(children)) return null;

    const height = 35;
    const terminateOffset = 5;
	const selectedValues = getValue();
	const initialOffset = selectedValues[0] ? options.indexOf(selectedValues[0]) * height : 0;
    const heightNeeded = (height * children.length) + terminateOffset;

	return (
		<FixedSizeList
			width={""}
			itemSize={height}
			height={heightNeeded > maxHeight ? maxHeight : heightNeeded}
			itemCount={children.length}
			initialScrollOffset={initialOffset}
		>
			{({ index, style }) => (
				<div className="option-wrapper" style={style}>
					{children[index]}
				</div>
			)}
		</FixedSizeList>
	);
};

const OptimizedOption = (props) => {
	delete props.innerProps.onMouseOver;
	return <components.Option {...props}>{props.children}</components.Option>;
};

export const optimizeSelect = {
	components: {
		MenuList: OptimizedMenuList,
		Option: OptimizedOption,
	},
};

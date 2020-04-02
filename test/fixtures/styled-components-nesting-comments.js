import styled, { css } from 'styled-components';
const Message1 = styled.p`
	padding: 10px;
	${
		// inline-comment 1
		css`
		color: #b02d00;
		${css`
			background: white;
		`
	/* block-comment 2 */
	}
	`}
`;

import styled from 'styled-components';
import { Image as ImageUI } from 'rimble-ui';
import { Link as LinkUI } from 'react-router-dom';

const Image = styled(ImageUI)`
    height:250px;
    width:100%;
    object-fit:cover;
    border-radius: 0;
`
const Link = styled(LinkUI)`
    text-decoration:none;
    color:#000;
`

export { Image, Link }
import React from "react";

import "./css/Pagination.css";

import { Button, ButtonGroup } from 'reactstrap';

const Pagination = ({ currentPage, cheatsheetPerPage, totalCount, paginate, nextPage, previousPage, isPrev, isNext }) => {
    const pageNum = [];
    const totalPage = Math.ceil(totalCount / cheatsheetPerPage);

    for (let i = 1; i <= totalPage; i++) {
        const active = (currentPage === i ? "active" : "");
        pageNum.push(<Button className={`waves-effect ${active}`} key={i} onClick={() => paginate(i)}>{i}</Button>)
    }

    const pages = (pageNum) => {
        if ((currentPage >= 5) && (totalPage-currentPage >= 5)){
            return pageNum.slice(currentPage - 5, currentPage + 5)
        } else if (currentPage >= 1 && currentPage <= 5) {
            return pageNum.slice(0, 10)
        } else if (totalPage-currentPage <= 5) {
            return pageNum.slice(totalPage-10,totalPage)
        }
    }

    return (
        <nav>
            <ul className="pagination justify-content-center">
                <ButtonGroup>
                    {isPrev
                        ? (<Button variant="light" classname="page" onClick={() => previousPage()}>
                            Prev
                </Button>)
                        : <div></div>
                    }
                    {pages(pageNum)}
                    {isNext || (Math.ceil(totalCount / cheatsheetPerPage) === 1)
                        ? (<Button variant="light" className="page" onClick={() => nextPage()}>
                            Next
                </Button>)
                        : <div></div>
                    }
                </ButtonGroup>
            </ul>
        </nav>
    )
}

export default Pagination;
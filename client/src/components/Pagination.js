import React from "react";

import Button from "reactstrap/lib/Button";
import ButtonGroup from "reactstrap/lib/ButtonGroup";

import "./css/Pagination.css";

const Pagination = ({ currentPage, cheatsheetPerPage, totalCount, paginate, nextPage, previousPage, isPrev, isNext }) => {
    const pageNum = [];

    for (let i = 1; i <= Math.ceil(totalCount / cheatsheetPerPage); i++) {
        const active = (currentPage === i ? "active" :"");
        pageNum.push(<Button className={`waves-effect ${active}`} key={i} onClick={() => paginate(i)}>{i}</Button>)
    }

    return (
        <nav>
            <ul className="pagination justify-content-center">

                <ButtonGroup>
                    {isPrev
                        ? (<Button variant="light" className="page" onClick={() => previousPage()}>
                            Prev
                </Button>)
                        : <div></div>
                    }
                    {pageNum}
                    {isNext
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
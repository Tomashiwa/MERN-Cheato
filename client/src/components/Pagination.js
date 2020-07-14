import React from "react";

import "./css/Pagination.css";

import Button from "reactstrap/lib/Button";
import ButtonGroup from "reactstrap/lib/ButtonGroup";

const Pagination = ({ currentPage, cheatsheetPerPage, totalCount, paginate, nextPage, previousPage, isPrev, isNext }) => {
    const pageNum = [];

    for (let i = 1; i <= Math.ceil(totalCount / cheatsheetPerPage); i++) {
        const active = (currentPage === i ? "active" :"");
        pageNum.push(<Button className={`waves-effect ${active}`} key={i} onClick={() => paginate(i)}>{i}</Button>)
    }
    console.log(pageNum)
   /* {pageNum.map(number => (
        <Button key={number} variant="light" className={`waves-effect ${active}`} onClick={() => paginate(number)}>
            {number}
        </Button>
    ))}*/

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
                    {pageNum}
                    {isNext
                        ? (<Button variant="light" classname="page" onClick={() => nextPage()}>
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
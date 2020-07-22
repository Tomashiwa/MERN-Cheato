import React, { useState, useRef, useEffect } from "react";

import Button from "reactstrap/lib/Button";
import ButtonGroup from "reactstrap/lib/ButtonGroup";

import "./css/Pagination.css";

const Pagination = ({ currentPage, cheatsheetPerPage, totalCount, paginate, nextPage, previousPage, isPrev, isNext }) => {
    const [pageNums, setPageNums] = useState([]);
    const totalPageRef = useRef(Math.ceil(totalCount / cheatsheetPerPage));
    
    const pages = (pageNum) => {
        if ((currentPage >= 5) && (totalPageRef.current - currentPage >= 5)){
            return pageNum.slice(currentPage - 5, currentPage + 5)
        } else if (currentPage >= 1 && currentPage <= 5) {
            return pageNum.slice(0, 10)
        } else if (totalPageRef.current -currentPage <= 5) {
            return pageNum.slice(totalPageRef.current - 10, totalPageRef.current)
        }
    }

    const resetView = () => window.scrollTo(0, 0);
    const previous = () => {
        previousPage();
        resetView();
    }
    const next = () => {
        nextPage();
        resetView();
    }
    
    useEffect(() => {
        const selectPage = pageNum => {
            paginate(pageNum);
            resetView();
        }
        
        let newPageNums = [];

        for (let i = 1; i <= totalPageRef.current; i++) {
            const active = (currentPage === i ? "active" : "");
            newPageNums.push(
                <Button 
                    className={`waves-effect ${active}`} 
                    key={i} 
                    onClick={() => selectPage(i)}>
                {i}
                </Button>);
        }

        setPageNums(newPageNums);
    }, [currentPage, paginate]);

    return (
        <nav>
            <ul className="pagination justify-content-center">
                <ButtonGroup>
                    {isPrev
                        ? (<Button variant="light" className="page" onClick={() => previous()}>
                            Prev
                </Button>)
                        : <div></div>
                    }
                    {pages(pageNums)}
                    {isNext
                        ? (<Button variant="light" className="page" onClick={() => next()}>
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
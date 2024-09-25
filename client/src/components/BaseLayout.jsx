import { Outlet } from "react-router-dom";
import { Row } from "react-bootstrap";
import NavHeader from "./NavHeader.jsx";

function BaseLayout(props) {
    return (
        <>
            <NavHeader loggedIn={props.loggedIn} logout={props.logout}/>
            <section className="container-fluid h-100 m-0 pt-5">
                <Row className="h-100 main-container overflow-auto">
                    <Outlet />
                </Row>
            </section>
        </>
    );
};

export default BaseLayout;
import React from "react";
import { render, screen } from "@testing-library/react";
import Home from "../pages/home/index";

describe("Home", () => {
  it("renders a heading", () => {
    render(<Home />);

    const heading = screen.getByRole("heading", {
      name: /home page/i,
    });

    expect(heading).toBeInTheDocument();
  });
});

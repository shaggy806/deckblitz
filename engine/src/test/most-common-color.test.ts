/**
 * The most common color among permanents (rule 105.2): `most-common-color`, each permanent
 * counted once per color, a token stack once per token, and a tie either counting (the
 * Invasion Djinns, Heroic Defiance, Tsabo's Assassin, Barrin's Unmaking) or not (Call to Arms).
 */
import { describe, expect, it } from "vitest";

import { changeDefinitionText } from "../text-change.js";

import {
  A,
  B,
  activate,
  cast,
  destroy,
  hand,
  lands,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

describe("Ruham Djinn: a color among all permanents, ties counting", () => {
  it("is 5/5 while another color leads, 3/3 once white ties and once it leads", () => {
    const { game } = table();
    const djinn = spawn(game, "Ruham Djinn");
    // Itself alone: white leads.
    expect(pt(game, djinn)).toEqual({ power: 3, toughness: 3 });
    // Two green permanents, on anyone's side: green leads.
    spawn(game, "Grizzly Bears", B);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(pt(game, djinn)).toEqual({ power: 5, toughness: 5 });
    // A white permanent ties: "or is tied".
    spawn(game, "Savannah Lions");
    expect(pt(game, djinn)).toEqual({ power: 3, toughness: 3 });
    game.state.objects[bears].stackCount = 3;
    expect(pt(game, djinn)).toEqual({ power: 5, toughness: 5 });
  });

  it("counts a multicolored permanent for each of its colors, and a colorless one for none", () => {
    const { game } = table();
    const djinn = spawn(game, "Ruham Djinn");
    spawn(game, "Memnite");
    spawn(game, "Memnite");
    expect(pt(game, djinn)).toEqual({ power: 3, toughness: 3 });
    spawn(game, "Grizzly Bears", B);
    // Selesnya Guildmage is green and white: white 2, green 2.
    spawn(game, "Selesnya Guildmage", B);
    expect(pt(game, djinn)).toEqual({ power: 3, toughness: 3 });
    spawn(game, "Grizzly Bears", B);
    expect(pt(game, djinn)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("a changed color word (rule 612)", () => {
  it("reads the color the Djinn's text now says", () => {
    const { game } = table();
    const def = changeDefinitionText(registryOf(game).get("Ruham Djinn"), [{ from: "white", to: "green" }]);
    const condition = def.static[0].condition;
    expect(condition).toEqual({ kind: "most-common-color", color: "G" });
  });
});

describe("Heroic Defiance: the enchanted creature's colors", () => {
  it("gives +3/+3 only while the creature has no most common color", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Heroic Defiance"), { targets: [ref(bears)] });
    // White 1 (the Aura), green 1: tied, and green is among them.
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    // White takes the lead: the bears share no color with it.
    spawn(game, "Savannah Lions");
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Tsabo's Assassin and Barrin's Unmaking: the target's colors at resolution", () => {
  it("destroys a creature of the most common color and spares another", () => {
    const { game } = table();
    const assassin = spawn(game, "Tsabo's Assassin");
    const lions = spawn(game, "Savannah Lions", B);
    activate(game, assassin, 0, { targets: [ref(lions)] });
    // Black 1 and white 1 tie, so the white creature has one of them.
    expect(zone(game, lions)).toBe("graveyard");
  });

  it("does nothing to a creature of a less common color", () => {
    const { game } = table();
    const assassin = spawn(game, "Tsabo's Assassin");
    spawn(game, "Dross Crocodile");
    const lions = spawn(game, "Savannah Lions", B);
    activate(game, assassin, 0, { targets: [ref(lions)] });
    expect(zone(game, lions)).toBe("battlefield");
  });

  it("returns a permanent of the most common color, not counting itself on the stack", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Barrin's Unmaking"), { targets: [ref(bears)] });
    expect(hand(game, B)).toContain(bears);
  });

  it("leaves a permanent of a less common color", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Savannah Lions");
    spawn(game, "Savannah Lions");
    lands(game, "Island", 2);
    cast(game, toHand(game, "Barrin's Unmaking"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Call to Arms: a chosen color among the chosen player's nontoken permanents", () => {
  const seated = () => {
    const t = table({ players: 3 });
    const { game, a } = t;
    // Bob: two green permanents and a white one.
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Savannah Lions", B);
    lands(game, "Plains", 2);
    a.chooseCreatureTypeFn = (_view, _source, options) => (options.includes("G") ? "G" : (options.includes(B) ? B : options[0]));
    return { ...t, bears };
  };

  it("asks for a color and an opponent, and pumps white creatures while the color strictly leads", () => {
    const { game } = seated();
    const lions = spawn(game, "Savannah Lions");
    cast(game, toHand(game, "Call to Arms"));
    const permanent = game.state.zones.shared.battlefield.find(
      (id) => game.state.objects[id].cardName === "Call to Arms",
    )!;
    expect(game.state.objects[permanent].chosenOnEnter).toBe("G");
    expect(game.state.objects[permanent].chosenPlayer).toBe(B);
    expect(pt(game, lions)).toEqual({ power: 3, toughness: 2 });
  });

  it("is sacrificed when the color is tied, and doesn't count a token", () => {
    const { game, bears } = seated();
    cast(game, toHand(game, "Call to Arms"));
    const permanent = game.state.zones.shared.battlefield.find(
      (id) => game.state.objects[id].cardName === "Call to Arms",
    )!;
    // Two white tokens: among nontoken permanents green still leads, 2 to 1.
    const token = spawn(game, "Savannah Lions", B);
    game.state.objects[token].isToken = true;
    game.state.objects[token].stackCount = 2;
    destroy(game, spawn(game, "Memnite", B));
    settle(game);
    expect(zone(game, permanent)).toBe("battlefield");
    // A bear dies: green 1, white 1. Tied.
    destroy(game, bears);
    settle(game);
    expect(game.state.objects[permanent].zone).toBe("graveyard");
    expect(game.state.objects[permanent].owner).toBe(A);
  });
});

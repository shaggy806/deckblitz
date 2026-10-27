/**
 * Odyssey (ODY; B231), group E. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  graveyard,
  hand,
  lands,
  life,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  types,
  zone,
} from "./harness.js";

describe("Immobilizing Ink", () => {
  it("gives the enchanted creature a discard-to-untap ability", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    cast(game, toHand(game, "Immobilizing Ink"), { targets: [ref(bears)] });
    const card = toHand(game, "Wastes");
    a.chooseDiscardsFn = () => [card];
    activate(game, bears);
    expect(zone(game, card)).toBe("graveyard");
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});

describe("Cabal Patriarch", () => {
  it("exiling a creature card from your graveyard gives -2/-2", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const patriarch = spawn(game, "Cabal Patriarch");
    const dead = toGraveyard(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    activate(game, patriarch, 1, { targets: [ref(giant)] });
    expect(zone(game, dead)).toBe("exile");
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Chlorophant", () => {
  it("gets one counter each upkeep without threshold", () => {
    const { game, a } = table();
    const plant = spawn(game, "Chlorophant");
    pickModes(a, 0);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, plant)).toBe(1);
  });

  it("gets two counters each upkeep with threshold", () => {
    const { game, a } = table();
    const plant = spawn(game, "Chlorophant");
    for (let i = 0; i < 7; i++) toGraveyard(game, "Grizzly Bears");
    pickModes(a, 0);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, plant)).toBe(2);
  });
});

describe("Filthy Cur", () => {
  it("its controller loses life equal to the damage dealt to it", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const cur = spawn(game, "Filthy Cur");
    cast(game, toHand(game, "Shock"), { targets: [ref(cur)] });
    expect(zone(game, cur)).toBe("graveyard");
    expect(life(game, A)).toBe(18);
  });
});

describe("Aven Windreader", () => {
  it("the target player reveals their top card and keeps it", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const reader = spawn(game, "Aven Windreader");
    const top = game.state.zones.perPlayer[B].library[0];
    activate(game, reader, 0, { targets: [ref(B)] });
    expect(game.state.zones.shared.stack.length).toBe(0);
    expect(zone(game, top)).toBe("library");
  });
});

describe("Mudhole", () => {
  it("exiles only the land cards from the target player's graveyard", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const land = toGraveyard(game, "Forest", B);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Mudhole"), { targets: [ref(B)] });
    expect(zone(game, land)).toBe("exile");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Vivify", () => {
  it("animates the land as a 3/3 and draws a card", () => {
    const { game } = table();
    const [forest] = lands(game, "Forest", 3);
    const spell = toHand(game, "Vivify");
    const before = hand(game).length;
    cast(game, spell, { targets: [ref(forest)] });
    expect(pt(game, forest)).toEqual({ power: 3, toughness: 3 });
    expect(types(game, forest)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(hand(game).length).toBe(before);
  });
});

describe("Shower of Coals", () => {
  it("deals 2 to each target without threshold", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Shower of Coals"), { targets: [ref(B), ref(giant), null] });
    expect(life(game, B)).toBe(18);
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("deals 4 to each target with threshold", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    for (let i = 0; i < 7; i++) toGraveyard(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Shower of Coals"), { targets: [ref(B), ref(giant), null] });
    expect(life(game, B)).toBe(16);
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Howling Gale", () => {
  it("deals 1 to each flier and each player", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const birds = spawn(game, "Birds of Paradise", B);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Howling Gale"));
    expect(zone(game, birds)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(19);
  });
});

describe("Zombie Assassin", () => {
  it("exiles two graveyard cards and itself to destroy a nonblack creature", () => {
    const { game } = table();
    const assassin = spawn(game, "Zombie Assassin");
    for (let i = 0; i < 3; i++) toGraveyard(game, "Wastes");
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, assassin, 0, { targets: [ref(bears)] });
    expect(zone(game, assassin)).toBe("exile");
    expect(graveyard(game).length).toBe(1);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Twigwalker", () => {
  it("sacrifices itself to give two creatures +2/+2", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const twig = spawn(game, "Twigwalker");
    const x = spawn(game, "Grizzly Bears");
    const y = spawn(game, "Llanowar Elves");
    activate(game, twig, 0, { targets: [ref(x), ref(y)] });
    expect(zone(game, twig)).toBe("graveyard");
    expect(pt(game, x)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, y)).toEqual({ power: 3, toughness: 3 });
  });
});

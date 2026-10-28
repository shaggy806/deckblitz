import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  graveyard,
  hand,
  lands,
  nextTurn,
  pickFromZone,
  pickModes,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

describe("R3 group C — Murmurs from Beyond", () => {
  it("the opponent's pick of one revealed card goes to the graveyard, the other two to your hand", () => {
    const { game, b } = table();
    lands(game, "Island", 3);
    const third = toLibrary(game, "Grizzly Bears");
    const second = toLibrary(game, "Serra Angel");
    const top = toLibrary(game, "Hill Giant");
    // Bob keeps the two Alice gets; the one he leaves is "the one he chose".
    const picked = pickFromZone(b, top, third);
    cast(game, toHand(game, "Murmurs from Beyond"));
    expect([...picked.offered].sort()).toEqual([top, second, third].sort());
    expect(hand(game, A)).toContain(top);
    expect(hand(game, A)).toContain(third);
    expect(zone(game, second)).toBe("graveyard");
    expect(graveyard(game, A)).toContain(second);
  });
});

describe("R3 group C — Assault Suit", () => {
  it("at an opponent's upkeep, you may hand them the equipped creature, untapped, until end of turn", () => {
    const { game, a } = table();
    lands(game, "Wastes", 3);
    const suit = spawn(game, "Assault Suit");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, suit, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    game.state.objects[bears].tapped = true;
    pickModes(a, 0);
    nextTurn(game, "draw");
    expect(controller(game, bears)).toBe(B);
    expect(game.state.objects[bears].tapped).toBe(false);
    nextTurn(game);
    expect(controller(game, bears)).toBe(A);
  });
});

describe("R3 group C — O-Kagachi Made Manifest", () => {
  it("the defending player picks a nonland card from your graveyard; it returns and pumps by its mana value", () => {
    const { game, a, b } = table();
    // On the battlefield back face up, as chapter III returns it.
    const dragon = spawn(game, "The Kami War");
    game.state.objects[dragon].face = 1;
    expect(pt(game, dragon)).toEqual({ power: 6, toughness: 6 });
    const angel = toGraveyard(game, "Serra Angel");
    const bears = toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Forest");
    const picked = pickFromZone(b, angel);
    attack(game, a, [dragon]);
    expect([...picked.offered].sort()).toEqual([angel, bears].sort());
    expect(hand(game, A)).toContain(angel);
    expect(zone(game, bears)).toBe("graveyard");
    expect(pt(game, dragon)).toEqual({ power: 11, toughness: 6 });
    expect(game.state.players[B].life).toBe(9);
  });
});

describe("R3 group C — Willbreaker", () => {
  it("targeting an opponent's creature with your spell steals it", () => {
    const { game } = table();
    spawn(game, "Willbreaker");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(A);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
  });

  it("ends once another player gains control of Willbreaker", () => {
    const { game } = table();
    const breaker = spawn(game, "Willbreaker");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(A);
    lands(game, "Island", 3);
    cast(game, toHand(game, "Donate"), { targets: [ref(B), ref(breaker)] });
    expect(controller(game, breaker)).toBe(B);
    expect(controller(game, bears)).toBe(B);
  });
});

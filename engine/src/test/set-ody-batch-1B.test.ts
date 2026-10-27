/**
 * Odyssey (ODY; B225) — group B: threshold, granted land abilities, the Thought beasts.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  hand,
  lands,
  life,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  controller,
  zone,
} from "./harness.js";

const fillGraveyard = (game: Parameters<typeof spawn>[0], n = 7): void => {
  for (let i = 0; i < n; i++) toGraveyard(game, "Grizzly Bears");
};

describe("Zombie Infestation", () => {
  it("discards two cards to make a 2/2 Zombie", () => {
    const { game } = table();
    const infestation = spawn(game, "Zombie Infestation");
    const before = hand(game, A).length;
    activate(game, infestation, 0);
    expect(hand(game, A).length).toBe(before - 2);
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);
  });
});

describe("Druid's Call", () => {
  it("gives the enchanted creature's controller a Squirrel for each damage it is dealt", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Mountain", 1);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Druid's Call"), { targets: [ref(giant)] });
    cast(game, toHand(game, "Shock"), { targets: [ref(giant)] });
    expect(tokensNamed(game, "Squirrel Token", B)).toBe(2);
    expect(tokensNamed(game, "Squirrel Token", A)).toBe(0);
  });
});

describe("Terravore", () => {
  it("counts land cards in every graveyard and nothing else", () => {
    const { game } = table();
    const vore = spawn(game, "Terravore");
    toGraveyard(game, "Forest");
    toGraveyard(game, "Forest");
    toGraveyard(game, "Island", B);
    toGraveyard(game, "Grizzly Bears");
    expect(pt(game, vore)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Nomad Stadium", () => {
  it("gains 4 life only with threshold", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const stadium = spawn(game, "Nomad Stadium");
    expect(() => activate(game, stadium, 1)).toThrow();
    fillGraveyard(game);
    activate(game, stadium, 1);
    expect(life(game, A)).toBe(24);
    expect(zone(game, stadium)).toBe("graveyard");
  });
});

describe("Chamber of Manipulation", () => {
  it("gives the land a discard ability that steals a creature", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const land = spawn(game, "Island");
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Chamber of Manipulation"), { targets: [ref(land)] });
    game.state.objects[land].tapped = false;
    const before = hand(game, A).length;
    activate(game, land, 1, { targets: [ref(bears)] });
    expect(hand(game, A).length).toBe(before - 1);
    expect(controller(game, bears)).toBe(A);
  });
});

describe("Caustic Tar", () => {
  it("gives the land a tap ability that drains 3", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    const land = spawn(game, "Swamp");
    cast(game, toHand(game, "Caustic Tar"), { targets: [ref(land)] });
    game.state.objects[land].tapped = false;
    activate(game, land, 1, { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
  });
});

describe("Divine Sacrament", () => {
  it("pumps every white creature, and again with threshold", () => {
    const { game } = table();
    spawn(game, "Divine Sacrament");
    const mine = spawn(game, "Savannah Lions");
    const theirs = spawn(game, "Savannah Lions", B);
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, mine)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    fillGraveyard(game);
    expect(pt(game, mine)).toEqual({ power: 4, toughness: 3 });
    expect(pt(game, theirs)).toEqual({ power: 4, toughness: 3 });
  });
});

describe("Escape Artist", () => {
  it("discards a card to return itself to hand", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const artist = spawn(game, "Escape Artist");
    const before = hand(game, A).length;
    activate(game, artist, 0);
    expect(zone(game, artist)).toBe("hand");
    expect(hand(game, A).length).toBe(before);
  });
});

describe("Pianna, Nomad Captain", () => {
  it("pumps every attacking creature", () => {
    const { game, a } = table();
    const pianna = spawn(game, "Pianna, Nomad Captain");
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    attack(game, a, [pianna, bears]);
    expect(life(game, B)).toBe(14);
  });
});

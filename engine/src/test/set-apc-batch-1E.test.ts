/**
 * Set walk batch 218, group E (2026-10-27): Apocalypse (APC).
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";

import {
  A,
  B,
  activate,
  cast,
  enter,
  graveyard,
  hand,
  lands,
  life,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  registryOf,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Apocalypse, group E", () => {
  it("Brass Herald takes every creature of the chosen type from the top four and pumps that type", () => {
    const { game, a } = table();
    a.chooseCreatureTypeFn = () => "Bear";
    const elf = toLibrary(game, "Llanowar Elves");
    const bear1 = toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Wastes");
    const bear2 = toLibrary(game, "Grizzly Bears");
    const theirBear = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 6);
    cast(game, toHand(game, "Brass Herald"));
    expect(zone(game, bear1)).toBe("hand");
    expect(zone(game, bear2)).toBe("hand");
    expect(zone(game, elf)).toBe("library");
    // "Creatures of the chosen type" — anyone's.
    expect(pt(game, theirBear)).toEqual({ power: 3, toughness: 3 });
  });

  it("Ana Sanctuary gives +1/+1 with one of blue or black, +5/+5 with both", () => {
    const { game, a } = table();
    spawn(game, "Ana Sanctuary");
    spawn(game, "Storm Crow");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    nextTurn(game);
    nextTurn(game);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    spawn(game, "Typhoid Rats");
    nextTurn(game);
    nextTurn(game);
    expect(pt(game, bears)).toEqual({ power: 7, toughness: 7 });
  });

  it("Necra Sanctuary makes the target lose 1 with green or white, 3 with both", () => {
    const { game, a } = table();
    spawn(game, "Necra Sanctuary");
    spawn(game, "Savannah Lions");
    pickTargets(a, B);
    nextTurn(game);
    nextTurn(game);
    expect(life(game, B)).toBe(19);
    spawn(game, "Grizzly Bears");
    nextTurn(game);
    nextTurn(game);
    expect(life(game, B)).toBe(16);
  });

  it("Last Stand counts each basic land type separately", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    lands(game, "Forest", 2);
    const target = spawn(game, "Savannah Lions", B);
    const stand = toHand(game, "Last Stand");
    const before = hand(game).length;
    cast(game, stand, { targets: [ref(B), ref(target)] });
    expect(life(game, B)).toBe(18);
    expect(zone(game, target)).toBe("graveyard");
    expect(tokensNamed(game, "Saproling Token", A)).toBe(2);
    expect(life(game, A)).toBe(22);
    // Last Stand left the hand, one drawn, one discarded.
    expect(hand(game).length).toBe(before - 1);
    expect(graveyard(game).length).toBe(2);
  });

  it("Urborg Uprising with no targets still draws", () => {
    const { game, a } = table();
    toGraveyard(game, "Grizzly Bears");
    lands(game, "Swamp", 5);
    pickTargets(a, null, null);
    const uprising = toHand(game, "Urborg Uprising");
    const before = hand(game).length;
    cast(game, uprising, { targets: [null, null] });
    expect(hand(game).length).toBe(before);
  });

  it("Desolation Angel destroys only your lands unkicked, every land kicked", () => {
    const unkicked = table();
    const mine = lands(unkicked.game, "Swamp", 5);
    const theirs = spawn(unkicked.game, "Forest", B);
    cast(unkicked.game, toHand(unkicked.game, "Desolation Angel"));
    expect(mine.every((id) => zone(unkicked.game, id) === "graveyard")).toBe(true);
    expect(zone(unkicked.game, theirs)).toBe("battlefield");

    const kicked = table();
    lands(kicked.game, "Swamp", 5);
    lands(kicked.game, "Plains", 2);
    const theirs2 = spawn(kicked.game, "Forest", B);
    cast(kicked.game, toHand(kicked.game, "Desolation Angel"), { kicked: true });
    expect(zone(kicked.game, theirs2)).toBe("graveyard");
  });

  it("Dwarven Landslide kicked sacrifices a land and destroys two", () => {
    const { game } = table();
    const mine = [...lands(game, "Mountain", 2), ...lands(game, "Wastes", 6)];
    const [f1, f2] = lands(game, "Forest", 2, B);
    cast(game, toHand(game, "Dwarven Landslide"), { targets: [ref(f1), ref(f2)], kicked: true });
    expect(zone(game, f1)).toBe("graveyard");
    expect(zone(game, f2)).toBe("graveyard");
    expect(mine.filter((id) => zone(game, id) === "graveyard")).toHaveLength(1);
  });

  it("Jilt kicked bounces one creature and deals 2 to another", () => {
    const { game } = table();
    lands(game, "Island", 1);
    lands(game, "Mountain", 1);
    lands(game, "Wastes", 2);
    const bounced = spawn(game, "Grizzly Bears", B);
    const burned = spawn(game, "Savannah Lions", B);
    cast(game, toHand(game, "Jilt"), { targets: [ref(bounced), ref(burned)], kicked: true });
    expect(zone(game, bounced)).toBe("hand");
    expect(zone(game, burned)).toBe("graveyard");
  });

  it("Planar Despair shrinks every creature by the domain count", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    lands(game, "Forest", 1);
    const wurm = spawn(game, "Craw Wurm", B);
    cast(game, toHand(game, "Planar Despair"));
    expect(pt(game, wurm)).toEqual({ power: 4, toughness: 2 });
  });

  it("Spiritmonger becomes only the chosen color", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    const monger = spawn(game, "Spiritmonger");
    pickModes(a, 3);
    activate(game, monger, 1);
    expect([...computeCharacteristics(game.state, registryOf(game), monger).colors]).toEqual(["R"]);
  });

  it("Foul Presence shrinks its creature and gives it a -1/-1 tap ability", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const host = spawn(game, "Craw Wurm");
    const victim = spawn(game, "Savannah Lions", B);
    cast(game, toHand(game, "Foul Presence"), { targets: [ref(host)] });
    expect(pt(game, host)).toEqual({ power: 5, toughness: 3 });
    activate(game, host, 0, { targets: [ref(victim)] });
    expect(zone(game, victim)).toBe("graveyard");
  });

  it("Phyrexian Gargantua draws two and loses 2", () => {
    const { game } = table();
    const before = hand(game).length;
    enter(game, "Phyrexian Gargantua");
    expect(hand(game).length).toBe(before + 2);
    expect(life(game, A)).toBe(18);
  });
});

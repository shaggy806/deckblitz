/**
 * B253 group B: cards freed by the grant-static / land-type-setting /
 * choose-land-type / exchange-control families — each test the clause most
 * likely to be wrong.
 */

import { describe, expect, it } from "vitest";

import { intrinsicManaColors } from "../characteristics.js";
import {
  A,
  B,
  activate,
  attack,
  blockOffer,
  cast,
  controller,
  destroy,
  enter,
  life,
  named,
  pickModes,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const colors = (game: Game, id: ObjectId) => intrinsicManaColors(game.state, registryOf(game), game.state.objects[id]);

describe("B253 group B", () => {
  it("Multiversal Passage: the chosen type, tapped unless 2 life is paid", () => {
    const { game, a } = table();
    a.chooseCreatureTypeFn = (_view, _source, options) => (options.includes("Island") ? "Island" : options[0]);
    a.payLifeForUntappedFn = () => false;
    const tapped = toHand(game, "Multiversal Passage");
    game.dispatch({ type: "play-land", player: A, card: tapped });
    settle(game);
    expect(game.state.objects[tapped].tapped).toBe(true);
    expect(subtypes(game, tapped)).toEqual(["Island"]);
    expect(colors(game, tapped)).toEqual(["U"]);
    expect(life(game, A)).toBe(20);

    a.payLifeForUntappedFn = (_view, _source, amount) => amount === 2;
    const paid = toHand(game, "Multiversal Passage");
    game.dispatch({ type: "play-land", player: A, card: paid });
    settle(game);
    expect(game.state.objects[paid].tapped).toBe(false);
    expect(life(game, A)).toBe(18);
  });

  it("Convincing Mirage: the enchanted land is only the chosen type", () => {
    const { game, a } = table();
    for (let i = 0; i < 2; i++) spawn(game, "Island", A);
    const coast = spawn(game, "Yavimaya Coast", B);
    a.chooseCreatureTypeFn = (_view, _source, options) => (options.includes("Swamp") ? "Swamp" : options[0]);
    cast(game, toHand(game, "Convincing Mirage"), { targets: [ref(coast)] });
    expect(subtypes(game, coast)).toEqual(["Swamp"]);
    expect(colors(game, coast)).toEqual(["B"]);
  });

  it("Sea's Claim: the enchanted land is an Island tapping only for {U}", () => {
    const { game } = table();
    spawn(game, "Island", A);
    const coast = spawn(game, "Yavimaya Coast", B);
    cast(game, toHand(game, "Sea's Claim"), { targets: [ref(coast)] });
    expect(subtypes(game, coast)).toEqual(["Island"]);
    expect(colors(game, coast)).toEqual(["U"]);
  });

  it("Shifting Grift: two spree modes, each an exchange", () => {
    const { game } = table();
    for (let i = 0; i < 5; i++) spawn(game, "Island", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const giant = spawn(game, "Hill Giant", B);
    const mine = spawn(game, "Sol Ring", A);
    const theirs = spawn(game, "Mind Stone", B);
    cast(game, toHand(game, "Shifting Grift"), {
      modes: [0, 1],
      targets: [ref(bears), ref(giant), ref(mine), ref(theirs)],
    });
    expect(controller(game, bears)).toBe(B);
    expect(controller(game, giant)).toBe(A);
    expect(controller(game, mine)).toBe(B);
    expect(controller(game, theirs)).toBe(A);
  });

  it("Political Trickery: a land of yours for an opponent's", () => {
    const { game } = table();
    for (let i = 0; i < 3; i++) spawn(game, "Island", A);
    const wastes = spawn(game, "Wastes", A);
    const coast = spawn(game, "Yavimaya Coast", B);
    cast(game, toHand(game, "Political Trickery"), { targets: [ref(wastes), ref(coast)] });
    expect(controller(game, wastes)).toBe(B);
    expect(controller(game, coast)).toBe(A);
  });

  it("Kitsune: the two targets must be other creatures with different controllers", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const elves = spawn(game, "Llanowar Elves", A);
    const giant = spawn(game, "Hill Giant", B);
    let offered: readonly string[] = [];
    a.chooseTargetsFn = (_view, _source, _specs, legal) => {
      offered = (legal[0] ?? []).map((t) => JSON.stringify(t));
      return [ref(bears), ref(giant)];
    };
    pickModes(a, 0);
    const kitsune = enter(game, "Kitsune, Dragon's Daughter", A);
    expect(offered.length).toBeGreaterThan(0);
    expect(offered).not.toContain(JSON.stringify(ref(kitsune)));
    expect(controller(game, bears)).toBe(B);
    expect(controller(game, giant)).toBe(A);
    expect(controller(game, elves)).toBe(A);
  });

  it("Tide Shaper: kicked, the land is an Island while it stays; it gets +1/+1", () => {
    const { game, a } = table();
    for (let i = 0; i < 2; i++) spawn(game, "Island", A);
    const coast = spawn(game, "Yavimaya Coast", B);
    a.chooseTargetsFn = () => [ref(coast)];
    const card = toHand(game, "Tide Shaper");
    cast(game, card, { kicked: true });
    expect(subtypes(game, coast)).toEqual(["Island"]);
    expect(colors(game, coast)).toEqual(["U"]);
    expect(pt(game, card)).toEqual({ power: 2, toughness: 2 });
    destroy(game, card);
    expect(subtypes(game, coast)).toEqual([]);
  });

  it("Cyclopean Giant: dies, the land becomes a Swamp and the card is exiled", () => {
    const { game, a } = table();
    const giant = spawn(game, "Cyclopean Giant", A);
    const coast = spawn(game, "Yavimaya Coast", B);
    a.chooseTargetsFn = () => [ref(coast)];
    destroy(game, giant);
    settle(game);
    expect(subtypes(game, coast)).toEqual(["Swamp"]);
    expect(colors(game, coast)).toEqual(["B"]);
    expect(zone(game, giant)).toBe("exile");
  });

  it("Slimy Kavu: the land is a Swamp until end of turn", () => {
    const { game } = table();
    const kavu = spawn(game, "Slimy Kavu", A);
    const coast = spawn(game, "Yavimaya Coast", B);
    activate(game, kavu, 0, { targets: [ref(coast)] });
    expect(subtypes(game, coast)).toEqual(["Swamp"]);
    game.advanceUntil((s) => s.turn.number === 2);
    expect(subtypes(game, coast)).toEqual([]);
  });

  it("Unstable Frontier: only a land you control, the type chosen on resolution", () => {
    const { game, a } = table();
    const frontier = spawn(game, "Unstable Frontier", A);
    const mine = spawn(game, "Yavimaya Coast", A);
    const theirs = spawn(game, "Yavimaya Coast", B);
    a.chooseCreatureTypeFn = (_view, _source, options) => (options.includes("Mountain") ? "Mountain" : options[0]);
    expect(() => activate(game, frontier, 1, { targets: [ref(theirs)] })).toThrow();
    activate(game, frontier, 1, { targets: [ref(mine)] });
    expect(subtypes(game, mine)).toEqual(["Mountain"]);
    expect(colors(game, mine)).toEqual(["R"]);
  });

  it("Firefright Mage: only artifact and/or red creatures can block the target", () => {
    const { game, a } = table();
    const mage = spawn(game, "Firefright Mage", A);
    spawn(game, "Mountain", A);
    spawn(game, "Mountain", A);
    toHand(game, "Wastes");
    const bears = spawn(game, "Grizzly Bears", A);
    const greenBlocker = spawn(game, "Grizzly Bears", B);
    const redBlocker = spawn(game, "Raging Goblin", B);
    activate(game, mage, 0, { targets: [ref(bears)] });
    const offer = blockOffer(game, a, [bears]);
    const eligible = (id: string) => offer.eligible.find((e) => e.blocker === id)?.canBlock ?? [];
    expect(eligible(greenBlocker)).toEqual([]);
    expect(eligible(redBlocker)).toEqual([bears]);
  });

  it("Tatsunari: Keimi once, and the evasion on both creatures", () => {
    const { game, a } = table();
    const tatsunari = spawn(game, "Tatsunari, Toad Rider", A);
    for (let i = 0; i < 4; i++) spawn(game, "Plains", A);
    for (let i = 0; i < 2; i++) spawn(game, "Island", A);
    cast(game, toHand(game, "Pacifism"), { targets: [ref(spawn(game, "Grizzly Bears", B))] });
    expect(named(game, "Keimi", A).length).toBe(1);
    cast(game, toHand(game, "Pacifism"), { targets: [ref(spawn(game, "Grizzly Bears", B))] });
    expect(named(game, "Keimi", A).length).toBe(1);
    const keimi = named(game, "Keimi", A)[0];
    game.state.objects[keimi].summoningSick = false;
    activate(game, tatsunari, 0, { targets: [ref(keimi)] });
    const bears = spawn(game, "Grizzly Bears", B);
    const bird = spawn(game, "Birds of Paradise", B);
    const offer = blockOffer(game, a, [tatsunari, keimi]);
    const eligible = (id: string) => offer.eligible.find((e) => e.blocker === id)?.canBlock ?? [];
    expect(eligible(bears)).toEqual([]);
    expect([...eligible(bird)].sort()).toEqual([tatsunari, keimi].sort());
  });

  it("Graceful Antelope: the land becomes a Plains until it leaves", () => {
    const { game, a } = table();
    const antelope = spawn(game, "Graceful Antelope", A);
    const coast = spawn(game, "Yavimaya Coast", B);
    a.chooseTargetsFn = () => [ref(coast)];
    pickModes(a, 0);
    attack(game, a, [antelope]);
    expect(life(game, B)).toBe(19);
    expect(subtypes(game, coast)).toEqual(["Plains"]);
    destroy(game, antelope);
    expect(subtypes(game, coast)).toEqual([]);
  });
});

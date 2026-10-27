import { describe, expect, it } from "vitest";
import { poolCounts } from "../mana.js";
import {
  A,
  B,
  activate,
  cast,
  destroy,
  enter,
  graveyard,
  hand,
  lands,
  loyalty,
  named,
  nextTurn,
  pickModes,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
  counters,
  keywords,
} from "./harness.js";

describe("R2 group B rechecks", () => {
  it("Cathartic Pyre's second mode discards two and draws two", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const pyre = toHand(game, "Cathartic Pyre");
    const before = hand(game).length;
    const graveBefore = graveyard(game).length;
    pickModes(a, 2);
    cast(game, pyre, { modes: [1] });
    expect(hand(game).length).toBe(before - 1);
    // Two discarded and the Pyre itself.
    expect(graveyard(game).length).toBe(graveBefore + 3);
  });

  it("Cathartic Pyre's second mode may discard none", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const pyre = toHand(game, "Cathartic Pyre");
    const before = hand(game).length;
    pickModes(a, 0);
    cast(game, pyre, { modes: [1] });
    expect(hand(game).length).toBe(before - 1);
    expect(graveyard(game)).toEqual([pyre]);
  });

  it("Daretti's −2 sacrifices an artifact, then returns the target", () => {
    const { game } = table();
    const daretti = spawn(game, "Daretti, Scrap Savant");
    const ring = spawn(game, "Sol Ring");
    const stone = toGraveyard(game, "Mind Stone");
    loyalty(game, daretti, -2, { targets: [ref(stone)] });
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, stone)).toBe("battlefield");
  });

  it("Daretti's −2 returns nothing with no artifact to sacrifice", () => {
    const { game } = table();
    const daretti = spawn(game, "Daretti, Scrap Savant");
    const stone = toGraveyard(game, "Mind Stone");
    loyalty(game, daretti, -2, { targets: [ref(stone)] });
    expect(zone(game, stone)).toBe("graveyard");
  });

  it("Daretti's emblem returns an artifact at the next end step", () => {
    const { game } = table();
    const daretti = spawn(game, "Daretti, Scrap Savant");
    spawn(game, "Sol Ring");
    loyalty(game, daretti, -10, { atLeast: 10 });
    destroy(game, named(game, "Sol Ring", A)[0]);
    settle(game);
    expect(named(game, "Sol Ring", A).length).toBe(0);
    toStep(game, "end");
    settle(game);
    expect(named(game, "Sol Ring", A).length).toBe(1);
  });

  it("Fable: a Goblin Shaman, may discard up to two then draw that many, then Reflection copies another nonlegendary creature with haste", () => {
    const { game, a } = table();
    const fable = enter(game, "Fable of the Mirror-Breaker");
    expect(tokensNamed(game, "Goblin Shaman Token", A)).toBe(1);

    pickModes(a, 2);
    const handBefore = hand(game).length;
    const graveBefore = graveyard(game).length;
    toStep(game, "precombat-main");
    settle(game);
    // The draw step's card, then two discarded and two drawn.
    expect(hand(game).length).toBe(handBefore + 1);
    expect(graveyard(game).length).toBe(graveBefore + 2);

    toStep(game, "precombat-main");
    settle(game);
    const [reflection] = named(game, "Fable of the Mirror-Breaker", A);
    expect(reflection).toBeDefined();
    expect(game.state.objects[reflection].face).toBe(1);
    expect(fable).toBeDefined();
    // A turn later it's no longer summoning sick.
    toStep(game, "precombat-main");
    settle(game);

    const bears = spawn(game, "Grizzly Bears");
    const legend = spawn(game, "Kiki-Jiki, Mirror Breaker");
    lands(game, "Wastes", 2);
    const refuse = (target: string) =>
      game.canDispatch({ type: "activate-ability", player: A, source: reflection, abilityIndex: 0, targets: [ref(target as never)] });
    expect(refuse(legend)).not.toBeNull();
    expect(refuse(reflection)).not.toBeNull();
    activate(game, reflection, 0, { targets: [ref(bears)] });
    const copies = named(game, "Grizzly Bears", A).filter((id) => id !== bears);
    expect(copies.length).toBe(1);
    expect(keywords(game, copies[0]).has("haste")).toBe(true);
  });

  it("Kiki-Jiki, Mirror Breaker can't copy a legendary creature", () => {
    const { game } = table();
    const kiki = spawn(game, "Kiki-Jiki, Mirror Breaker");
    const legend = spawn(game, "Sokka, Bold Boomeranger");
    const bears = spawn(game, "Grizzly Bears");
    const refuse = (target: string) =>
      game.canDispatch({ type: "activate-ability", player: A, source: kiki, abilityIndex: 0, targets: [ref(target as never)] });
    expect(refuse(kiki)).not.toBeNull();
    expect(refuse(legend)).not.toBeNull();
    expect(refuse(bears)).toBeNull();
  });

  it("Electrosiphon gives energy equal to the countered spell's mana value, X included", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    lands(game, "Island", 2);
    const blaze = toHand(game, "Blaze");
    const siphon = toHand(game, "Electrosiphon");
    cast(game, blaze, { x: 2, targets: [ref(B)], settle: false });
    cast(game, siphon, { targets: [ref(blaze)] });
    expect(zone(game, blaze)).toBe("graveyard");
    expect(game.state.players[A].energy).toBe(3);
  });

  it("Blinkmoth Urn gives the active player {C} per artifact they control, only while untapped", () => {
    const { game } = table();
    spawn(game, "Blinkmoth Urn");
    spawn(game, "Sol Ring", B);
    spawn(game, "Mind Stone", B);
    nextTurn(game);
    settle(game);
    expect(game.state.turn.step).toBe("precombat-main");
    expect(poolCounts(game.state.players[B].manaPool).C).toBe(2);
    expect(game.state.players[A].manaPool.length).toBe(0);
  });

  it("Blinkmoth Urn does nothing while tapped", () => {
    const { game } = table();
    spawn(game, "Blinkmoth Urn", A, { tapped: true });
    spawn(game, "Sol Ring", B);
    nextTurn(game);
    settle(game);
    expect(game.state.players[B].manaPool.length).toBe(0);
  });

  it("Sokka grows on an artifact spell", () => {
    const { game } = table();
    const sokka = spawn(game, "Sokka, Bold Boomeranger");
    cast(game, toHand(game, "Ornithopter"));
    expect(counters(game, sokka)).toBe(1);
  });
});

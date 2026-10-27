/**
 * The need-keys recheck list R5 (batch B239): cards whose old blocker had
 * been built — each test pins the clause the old record doubted.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickTargets,
  pt,
  quiet,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";
import { computeCharacteristics } from "../characteristics.js";

const colorsOf = (game: Game, id: ObjectId): readonly string[] =>
  [...computeCharacteristics(game.state, game.registry, id).colors];

describe("recheck R5", () => {
  it("Thought Collapse: the countered spell's controller mills three", () => {
    const { game } = table();
    lands(game, "Island", 3);
    lands(game, "Mountain", 1, B);
    const bolt = toHand(game, "Lightning Bolt", B);
    game.state.priority.holder = B;
    cast(game, bolt, { player: B, targets: [ref(A)], settle: false });
    game.dispatch({ type: "pass-priority", player: B });
    cast(game, toHand(game, "Thought Collapse"), { targets: [ref(bolt)] });
    expect(zone(game, bolt)).toBe("graveyard");
    expect(graveyard(game, B).length).toBe(4);
    expect(graveyard(game, A).length).toBe(1);
    expect(life(game, A)).toBe(20);
  });

  it("Kiora Bests the Sea God II: what's already tapped stays tapped through the next untap step", () => {
    const { game, a } = table();
    pickTargets(a, B);
    enter(game, "Kiora Bests the Sea God");
    expect(tokensNamed(game, "Kraken Token (Kiora Bests the Sea God)", A)).toBe(1);
    nextTurn(game);
    const tappedBears = spawn(game, "Grizzly Bears", B, { tapped: true });
    const bears = spawn(game, "Grizzly Bears", B);
    const island = spawn(game, "Island", B);
    nextTurn(game); // alice's precombat main: chapter II
    settle(game);
    expect([tappedBears, bears, island].map((id) => game.state.objects[id].tapped === true)).toEqual([true, true, false]);
    nextTurn(game); // bob's untap step: neither creature untaps
    expect([tappedBears, bears].map((id) => game.state.objects[id].tapped === true)).toEqual([true, true]);
  });

  it("Illuminor Szeras adds {B} equal to the sacrificed creature's mana value, not for itself", () => {
    const { game } = table();
    const szeras = spawn(game, "Illuminor Szeras");
    const giant = spawn(game, "Hill Giant");
    game.dispatch({ type: "activate-ability", player: A, source: szeras, abilityIndex: 0, targets: [], sacrifice: giant });
    expect(zone(game, giant)).toBe("graveyard");
    expect(game.state.players[A].manaPool.filter((u) => u.type === "B").length).toBe(4);
    expect(game.canDispatch({ type: "activate-ability", player: A, source: szeras, abilityIndex: 0, targets: [], sacrifice: szeras })).not.toBeNull();
  });

  it("Scuttling Sentinel: the other creature gets a counter, becomes a blue Crab and gains hexproof until end of turn", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    enter(game, "Scuttling Sentinel");
    expect(counters(game, bears)).toBe(1);
    expect(colorsOf(game, bears)).toEqual(["U"]);
    expect(subtypes(game, bears)).toEqual(expect.arrayContaining(["Bear", "Crab"]));
    expect(keywords(game, bears).has("hexproof")).toBe(true);
    nextTurn(game);
    expect(colorsOf(game, bears)).toEqual(["G"]);
    expect(subtypes(game, bears)).not.toContain("Crab");
  });

  it("Persistent Constrictor: on an opponent's upkeep they lose 1 and one of their creatures gets a -1/-1 counter", () => {
    const { game, a } = table();
    spawn(game, "Persistent Constrictor");
    const theirs = spawn(game, "Hill Giant", B);
    spawn(game, "Grizzly Bears");
    pickTargets(a, theirs);
    nextTurn(game, "draw");
    expect(life(game, B)).toBe(19);
    expect(counters(game, theirs, "-1/-1")).toBe(1);
    expect(life(game, A)).toBe(20);
  });

  it("Skyfisher Spider: sacrifice another creature to destroy a nonland permanent; dying, gain life and exile itself", () => {
    const { game, a } = table();
    const fodder = spawn(game, "Grizzly Bears");
    const relic = spawn(game, "Mind Stone", B);
    toGraveyard(game, "Hill Giant");
    a.chooseModesFn = () => [0];
    pickTargets(a, relic);
    const spider = enter(game, "Skyfisher Spider");
    expect(zone(game, fodder)).toBe("graveyard");
    expect(zone(game, relic)).toBe("graveyard");
    destroy(game, spider);
    settle(game);
    // Hill Giant, the bears and the spider itself.
    expect(life(game, A)).toBe(23);
    expect(game.state.objects[spider]).toBeDefined();
    expect(graveyard(game, A).some((id) => game.state.objects[id].cardName === "Skyfisher Spider")).toBe(false);
  });

  it("Dinosaur Egg: discover X reads its toughness as it last existed", () => {
    const { game, a } = table();
    toLibrary(game, "Hill Giant");
    const egg = spawn(game, "Dinosaur Egg");
    game.state.objects[egg].counters["+1/+1"] = 1;
    expect(pt(game, egg).toughness).toBe(4);
    a.chooseModesFn = () => [0];
    destroy(game, egg);
    settle(game);
    expect(hand(game).some((id) => game.state.objects[id].cardName === "Hill Giant")).toBe(true);
  });

  it("Press the Enemy bounces a spell an opponent controls, then casts a cheaper-or-equal instant free", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    lands(game, "Mountain", 3, B);
    const bolt = toHand(game, "Lightning Bolt", B);
    const shock = toHand(game, "Shock");
    const scry = toHand(game, "Divination");
    const offered: ObjectId[][] = [];
    a.chooseCastNowFn = (_view, offer) => {
      offered.push([...offer.cards]);
      return { type: "cast-spell", player: A, card: shock, targets: [ref(B)], via: "effect", free: true };
    };
    game.state.priority.holder = B;
    cast(game, bolt, { player: B, targets: [ref(A)], settle: false });
    game.dispatch({ type: "pass-priority", player: B });
    cast(game, toHand(game, "Press the Enemy"), { targets: [ref(bolt)] });
    expect(zone(game, bolt)).toBe("hand");
    expect(offered[0]).toContain(shock);
    expect(offered[0]).not.toContain(scry);
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(18);
  });

  it("Astral Dragon: two 3/3 flying Dragon copies of a noncreature permanent; an Aura makes none", () => {
    const { game, a } = table();
    const stone = spawn(game, "Mind Stone", B);
    pickTargets(a, stone);
    enter(game, "Astral Dragon");
    const copies = game.state.zones.shared.battlefield.filter(
      (id) => game.state.objects[id].cardName === "Mind Stone" && game.state.objects[id].controller === A,
    );
    expect(copies.reduce((n, id) => n + (game.state.objects[id].stackCount ?? 1), 0)).toBe(2);
    expect(pt(game, copies[0])).toEqual({ power: 3, toughness: 3 });
    expect(subtypes(game, copies[0])).toContain("Dragon");
    expect(keywords(game, copies[0]).has("flying")).toBe(true);

    const second = table();
    const bears = spawn(second.game, "Grizzly Bears", B);
    const aura = spawn(second.game, "Pacifism", B);
    second.game.state.objects[aura].attachedTo = bears;
    pickTargets(second.a, aura);
    const before = second.game.state.zones.shared.battlefield.length;
    enter(second.game, "Astral Dragon");
    expect(second.game.state.zones.shared.battlefield.length).toBe(before + 1);
    expect(tokensNamed(second.game, "Pacifism", A)).toBe(0);
  });

  it("Sphere of Annihilation exiles itself and what's at or under its void counters, on the battlefield and in graveyards", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const sphere = toHand(game, "Sphere of Annihilation");
    cast(game, sphere, { x: 2 });
    expect(counters(game, sphere, "void")).toBe(2);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const deadBears = toGraveyard(game, "Grizzly Bears", B);
    const deadGiant = toGraveyard(game, "Hill Giant");
    nextTurn(game);
    nextTurn(game, "draw");
    expect([sphere, bears, deadBears].map((id) => zone(game, id))).toEqual(["exile", "exile", "exile"]);
    expect([giant, deadGiant].map((id) => zone(game, id))).toEqual(["battlefield", "graveyard"]);
  });

  it("Shisato makes the player it hits skip their next untap step", () => {
    const { game, a } = table();
    const shisato = spawn(game, "Shisato, Whispering Hunter");
    const theirs = spawn(game, "Island", B, { tapped: true });
    attack(game, a, [shisato]);
    expect(game.state.players[B].untapStepsToSkip).toBe(1);
    nextTurn(game);
    expect(game.state.objects[theirs].tapped).toBe(true);
    expect(quiet(game.state)).toBe(true);
  });
});

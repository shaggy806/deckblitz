/**
 * Time Spiral (TSP; B205) — group A: Fallen Ideal, Opaline Sliver, Paradise
 * Plume, Fungus Sliver, Screeching Sliver, Draining Whelk, Careful
 * Consideration, Ground Rift, Mwonvuli Acid-Moss.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Fallen Ideal", () => {
  it("gives the enchanted creature's controller the sacrifice ability, and returns to hand when it dies", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const fodder = spawn(game, "Grizzly Bears", B);
    const ideal = toHand(game, "Fallen Ideal");
    cast(game, ideal, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("flying")).toBe(true);
    game.advanceUntil((s) => s.priority.holder === B);
    game.dispatch({ type: "activate-ability", player: B, source: bears, abilityIndex: 0, targets: [], sacrifice: fodder });
    settle(game);
    expect(zone(game, fodder)).toBe("graveyard");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 3 });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(ideal)]);
    settle(game);
    expect(zone(game, ideal)).toBe("hand");
  });
});

describe("Opaline Sliver", () => {
  it("lets an opponent's Sliver's controller draw when it becomes the target of your spell", () => {
    const { game, b } = table();
    spawn(game, "Opaline Sliver");
    const theirs = spawn(game, "Might Sliver", B);
    lands(game, "Mountain", 1);
    const before = hand(game, B).length;
    pickModes(b, 0);
    cast(game, toHand(game, "Shock"), { targets: [ref(theirs)] });
    expect(hand(game, B)).toHaveLength(before + 1);
  });
});

describe("Paradise Plume", () => {
  it("gains its controller 1 life when any player casts a spell of the chosen colour, and taps for it", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    const plume = toHand(game, "Paradise Plume");
    game.dispatch({ type: "cast-spell", player: A, card: plume, targets: [] });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-creature-type");
    game.dispatch({ type: "choose-creature-type", player: A, creatureType: "G" });
    settle(game);
    expect(zone(game, plume)).toBe("battlefield");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 1, B);
    pickModes(a, 0);
    game.advanceUntil((s) => s.priority.holder === B);
    cast(game, toHand(game, "Giant Growth", B), { player: B, targets: [ref(bears)] });
    expect(life(game, A)).toBe(21);
    // A red spell doesn't trigger it.
    lands(game, "Mountain", 1);
    game.advanceUntil((s) => s.priority.holder === A);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, A)).toBe(21);
    expect(game.legalActions(A).some((o) => o.kind === "activate-ability" && o.source === plume)).toBe(true);
  });
});

describe("Fungus Sliver", () => {
  it("gives another player's Sliver creature a +1/+1 counter when it's dealt damage", () => {
    const { game } = table();
    spawn(game, "Fungus Sliver");
    const theirs = spawn(game, "Might Sliver", B);
    game.debugApplyEffect(A, { kind: "damage", amount: 1, target: 0 }, [ref(theirs)]);
    settle(game);
    expect(counters(game, theirs)).toBe(1);
  });
});

describe("Screeching Sliver", () => {
  it("has the granted mill ability itself", () => {
    const { game } = table();
    const screech = spawn(game, "Screeching Sliver");
    activate(game, screech, 0, { targets: [ref(B)] });
    expect(graveyard(game, B)).toHaveLength(1);
  });
});

describe("Draining Whelk", () => {
  it("counters the spell and grows by its mana value, X included", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    const stroke = toHand(game, "Stroke of Genius");
    cast(game, stroke, { targets: [ref(A)], x: 2, settle: false });
    pickTargets(a, stroke);
    const whelk = enter(game, "Draining Whelk");
    expect(zone(game, stroke)).toBe("graveyard");
    expect(counters(game, whelk)).toBe(5);
  });
});

describe("Careful Consideration", () => {
  it("draws four and discards two in your main phase, three otherwise", () => {
    const { game } = table();
    lands(game, "Island", 8);
    const first = toHand(game, "Careful Consideration");
    const before = hand(game, A).length;
    cast(game, first, { targets: [ref(A)] });
    expect(hand(game, A)).toHaveLength(before - 1 + 4 - 2);
    toStep(game, "end");
    const second = toHand(game, "Careful Consideration");
    const before2 = hand(game, A).length;
    cast(game, second, { targets: [ref(A)] });
    expect(hand(game, A)).toHaveLength(before2 - 1 + 4 - 3);
  });
});

describe("Ground Rift", () => {
  it("targets only a creature without flying", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const bird = spawn(game, "Cloudchaser Kestrel", B);
    const rift = toHand(game, "Ground Rift");
    expect(() => cast(game, rift, { targets: [ref(bird)] })).toThrow();
  });
});

describe("Mwonvuli Acid-Moss", () => {
  it("destroys the land and fetches a Forest tapped", () => {
    const { game, a } = table({ deck: "Forest" });
    lands(game, "Forest", 4);
    const land = spawn(game, "Island", B);
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    cast(game, toHand(game, "Mwonvuli Acid-Moss"), { targets: [ref(land)] });
    expect(zone(game, land)).toBe("graveyard");
    const forests = game.battlefield.filter(
      (id) => game.state.objects[id].cardName === "Forest" && game.state.objects[id].tapped,
    );
    // The four that paid, and the one it found, entered tapped.
    expect(forests).toHaveLength(5);
  });
});

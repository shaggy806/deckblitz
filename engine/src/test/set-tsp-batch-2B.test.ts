/**
 * Time Spiral (TSP; B228) — group B: Triskelavus, Stronghold Overseer,
 * Stonebrow, Traitor's Clutch, Tivadar, Spike Tiller, Haunting Hymn,
 * Subterranean Shambler and Durkwood Tracker.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  grant,
  hand,
  keywords,
  lands,
  life,
  named,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";
import { computeCharacteristics } from "../characteristics.js";

describe("Triskelavus", () => {
  it("removes a counter to make a Triskelavite that sacrifices itself for 1 damage", () => {
    const { game } = table();
    const trisk = enter(game, "Triskelavus");
    expect(counters(game, trisk)).toBe(3);
    lands(game, "Wastes", 1);
    activate(game, trisk, 0);
    expect(counters(game, trisk)).toBe(2);
    expect(tokensNamed(game, "Triskelavite Token", A)).toBe(1);
    const [token] = named(game, "Triskelavite Token", A);
    expect(keywords(game, token).has("flying")).toBe(true);
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: token,
      abilityIndex: 0,
      targets: [ref(B)],
      sacrifice: token,
    } as Parameters<typeof game.dispatch>[0]);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(life(game, B)).toBe(19);
    expect(tokensNamed(game, "Triskelavite Token", A)).toBe(0);
  });
});

describe("Stronghold Overseer", () => {
  it("shadow creatures get +1/+0 and the rest -1/-0", () => {
    const { game } = table();
    const overseer = spawn(game, "Stronghold Overseer");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 2);
    activate(game, overseer, 0);
    expect(pt(game, overseer)).toEqual({ power: 6, toughness: 5 });
    expect(pt(game, bears)).toEqual({ power: 1, toughness: 2 });
  });
});

describe("Stonebrow, Krosan Hero", () => {
  it("pumps only attackers with trample", () => {
    const { game, a } = table();
    const stonebrow = spawn(game, "Stonebrow, Krosan Hero");
    const trampler = spawn(game, "Grizzly Bears");
    grant(game, trampler, "trample");
    const plain = spawn(game, "Grizzly Bears");
    attack(game, a, [stonebrow, trampler, plain]);
    expect(pt(game, stonebrow)).toEqual({ power: 6, toughness: 6 });
    expect(pt(game, trampler)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, plain)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Traitor's Clutch", () => {
  it("gives +1/+0, black and shadow", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 5);
    pickTargets(a, bears);
    cast(game, toHand(game, "Traitor's Clutch"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("shadow")).toBe(true);
    expect([...computeCharacteristics(game.state, game.registry, bears).colors]).toEqual(["B"]);
  });
});

describe("Tivadar of Thorn", () => {
  it("destroys a target Goblin as it enters", () => {
    const { game, a } = table();
    const goblin = spawn(game, "Goblin Arsonist", B);
    pickTargets(a, goblin);
    enter(game, "Tivadar of Thorn");
    expect(zone(game, goblin)).toBe("graveyard");
  });
});

describe("Spike Tiller", () => {
  it("makes a land a 2/2 land creature for good and puts a counter on it", () => {
    const { game, a } = table();
    const tiller = enter(game, "Spike Tiller");
    expect(pt(game, tiller)).toEqual({ power: 3, toughness: 3 });
    const forest = spawn(game, "Forest", B);
    lands(game, "Wastes", 2);
    pickTargets(a, forest);
    activate(game, tiller, 1, { targets: [ref(forest)] });
    expect(counters(game, tiller)).toBe(2);
    expect(types(game, forest)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(pt(game, forest)).toEqual({ power: 3, toughness: 3 });
    toStep(game, "precombat-main");
    expect(types(game, forest)).toContain("creature");
  });
});

describe("Haunting Hymn", () => {
  it("makes the target discard four in your main phase, two otherwise", () => {
    const { game, a } = table();
    lands(game, "Swamp", 12);
    const before = hand(game, B).length;
    pickTargets(a, B);
    cast(game, toHand(game, "Haunting Hymn"), { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before - 4);
    toStep(game, "end");
    const mid = hand(game, B).length;
    cast(game, toHand(game, "Haunting Hymn"), { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(mid - 2);
  });
});

describe("Subterranean Shambler", () => {
  it("pings each creature without flying as it enters and as it leaves", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const drake = spawn(game, "Wind Drake", B);
    const shambler = enter(game, "Subterranean Shambler");
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].damageMarked).toBe(1);
    expect(game.state.objects[drake].damageMarked).toBe(0);
    destroy(game, shambler);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, drake)).toBe("battlefield");
  });
});

describe("Durkwood Tracker", () => {
  it("trades damage with an attacking creature", () => {
    const { game, a } = table();
    const tracker = spawn(game, "Durkwood Tracker");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "declare-blockers");
    pickTargets(a, bears);
    activate(game, tracker, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[tracker].damageMarked).toBe(2);
  });
});

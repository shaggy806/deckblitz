/**
 * B253 group D: cards freed by the "can't be blocked by [X] this turn"
 * restriction, granted statics, rule 305.7 land-type setting, the basic land
 * type chosen on resolution, and exchange of control.
 */

import { describe, expect, it } from "vitest";

import { intrinsicManaColors } from "../characteristics.js";
import {
  A,
  B,
  activate,
  blockOffer,
  cast,
  controller,
  counters,
  enter,
  hand,
  keywords,
  pickTargets,
  pt,
  ref,
  registryOf,
  spawn,
  subtypes,
  table,
  toHand,
  toStep,
  types,
} from "./harness.js";

describe("B253 group D", () => {
  it("Legion Loyalist: battalion gives first strike and trample, and creature tokens can't block", () => {
    const { game, a } = table();
    const loyalist = spawn(game, "Legion Loyalist", A);
    const g1 = spawn(game, "Raging Goblin", A);
    const g2 = spawn(game, "Raging Goblin", A);
    const token = game.debugSpawn("Goblin Soldier Token", B, "battlefield", { summoningSick: false });
    // A spawn is a card object; make it the token it stands for (rule 111).
    game.state.objects[token].isToken = true;
    const bears = spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [loyalist, g1, g2]);
    const eligible = (id: string) => offer.eligible.find((e) => e.blocker === id)?.canBlock ?? [];
    expect(keywords(game, g1).has("first-strike")).toBe(true);
    expect(keywords(game, g2).has("trample")).toBe(true);
    expect(eligible(token)).toEqual([]);
    expect([...eligible(bears)].sort()).toEqual([loyalist, g1, g2].sort());
  });

  it("Legion Loyalist: with only one other attacker, battalion doesn't trigger", () => {
    const { game, a } = table();
    const loyalist = spawn(game, "Legion Loyalist", A);
    const g1 = spawn(game, "Raging Goblin", A);
    const token = game.debugSpawn("Goblin Soldier Token", B, "battlefield", { summoningSick: false });
    game.state.objects[token].isToken = true;
    const offer = blockOffer(game, a, [loyalist, g1]);
    expect(keywords(game, loyalist).has("first-strike")).toBe(false);
    expect(offer.eligible.find((e) => e.blocker === token)?.canBlock.length).toBe(2);
  });

  it("Iron Man Armor: attaches as it enters; {2} animates it, counting artifacts, and it falls off", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    spawn(game, "Ornithopter", A);
    for (let i = 0; i < 4; i++) spawn(game, "Island", A);
    pickTargets(a, bears);
    const armor = enter(game, "Iron Man Armor", A);
    expect(game.state.objects[armor].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, bears).has("flying")).toBe(true);

    activate(game, armor, 0);
    expect(types(game, armor)).toContain("creature");
    expect(subtypes(game, armor)).toEqual(expect.arrayContaining(["Equipment", "Construct", "Hero"]));
    // Itself and the Ornithopter.
    expect(pt(game, armor)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, armor).has("flying")).toBe(true);
    expect(game.state.objects[armor].attachedTo).toBeNull();
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });

    // Already a creature: nothing happens (no second +1/+1 per artifact).
    activate(game, armor, 0);
    expect(pt(game, armor)).toEqual({ power: 2, toughness: 2 });

    game.advanceUntil((s) => s.turn.number === 2);
    expect(types(game, armor)).not.toContain("creature");
  });

  it("Squeak By: +1/+1, and creatures with power 3 or greater can't block it", () => {
    const { game, a } = table();
    const mine = spawn(game, "Grizzly Bears", A);
    spawn(game, "Plains", A);
    const mouse = toHand(game, "Cheeky House-Mouse");
    cast(game, mouse, { targets: [ref(mine)], face: 1 });
    expect(pt(game, mine)).toEqual({ power: 3, toughness: 3 });
    expect(game.state.objects[mouse].zone).toBe("exile");
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [mine]);
    const eligible = (id: string) => offer.eligible.find((e) => e.blocker === id)?.canBlock ?? [];
    expect(eligible(giant)).toEqual([]);
    expect(eligible(bears)).toEqual([mine]);
  });

  it("Resilient Roadrunner: only creatures with haste can block it", () => {
    const { game, a } = table();
    const runner = spawn(game, "Resilient Roadrunner", A);
    for (let i = 0; i < 3; i++) spawn(game, "Mountain", A);
    const bears = spawn(game, "Grizzly Bears", B);
    const goblin = spawn(game, "Raging Goblin", B);
    activate(game, runner, 0);
    const offer = blockOffer(game, a, [runner]);
    const eligible = (id: string) => offer.eligible.find((e) => e.blocker === id)?.canBlock ?? [];
    expect(eligible(bears)).toEqual([]);
    expect(eligible(goblin)).toEqual([runner]);
  });

  it("Vedalken Plotter: exchanges a land you control with an opponent's", () => {
    const { game, a } = table();
    const mine = spawn(game, "Island", A);
    const theirs = spawn(game, "Yavimaya Coast", B);
    pickTargets(a, mine, theirs);
    enter(game, "Vedalken Plotter", A);
    expect(controller(game, mine)).toBe(B);
    expect(controller(game, theirs)).toBe(A);
  });

  it("Djinn of Infinite Deceits: exchanges two creatures, but not during combat", () => {
    const { game } = table();
    const djinn = spawn(game, "Djinn of Infinite Deceits", A);
    const x = spawn(game, "Grizzly Bears", B);
    const z = spawn(game, "Grizzly Bears", A);
    activate(game, djinn, 0, { targets: [ref(z), ref(x)] });
    expect(controller(game, z)).toBe(B);
    expect(controller(game, x)).toBe(A);
    game.state.objects[djinn].tapped = false;
    const offered = (): boolean =>
      game.legalActions(A).some((action) => action.kind === "activate-ability" && action.source === djinn);
    expect(offered()).toBe(true);
    nextTurnCombat(game);
    expect(game.state.turn.step).toBe("begin-combat");
    expect(offered()).toBe(false);
  });

  it("Mindbender Spores: the blocked creature gets four fungus counters and stays tapped while it has one", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const spores = spawn(game, "Mindbender Spores", B);
    b.declareBlockersFn = () => [{ blocker: spores, attacker: bears }];
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "postcombat-main");
    expect(counters(game, bears, "fungus")).toBe(4);
    a.declareAttackersFn = () => [];
    // Alice's next turn: it didn't untap, and her upkeep took one counter.
    toStep(game, "precombat-main");
    expect(game.state.turn.number).toBe(3);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(counters(game, bears, "fungus")).toBe(3);
  });

  it("Tainted Well: draws a card; the enchanted land is a Swamp that taps only for {B}", () => {
    const { game } = table();
    const coast = spawn(game, "Yavimaya Coast", A);
    for (let i = 0; i < 3; i++) spawn(game, "Swamp", A);
    const before = hand(game).length;
    cast(game, toHand(game, "Tainted Well"), { targets: [ref(coast)] });
    expect(hand(game).length).toBe(before + 1);
    expect(subtypes(game, coast)).toEqual(["Swamp"]);
    expect(intrinsicManaColors(game.state, registryOf(game), game.state.objects[coast])).toEqual(["B"]);
  });

  it("Tundra Kavu: the choice is Plains or Island, and the land becomes it until end of turn", () => {
    const { game, a } = table();
    const kavu = spawn(game, "Tundra Kavu", A);
    const coast = spawn(game, "Yavimaya Coast", B);
    let offered: readonly string[] = [];
    a.chooseCreatureTypeFn = (_view, _source, options) => {
      offered = options;
      return "Island";
    };
    activate(game, kavu, 0, { targets: [ref(coast)] });
    expect([...offered].sort()).toEqual(["Island", "Plains"]);
    expect(subtypes(game, coast)).toEqual(["Island"]);
    game.advanceUntil((s) => s.turn.number === 2);
    expect(subtypes(game, coast)).toEqual([]);
  });
});

function nextTurnCombat(game: ReturnType<typeof table>["game"]): void {
  game.advanceUntil((s) => s.turn.step === "begin-combat" && s.priority.holder === A);
}

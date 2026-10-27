// Recheck list R4, group B: cards once blocked on needs since built.
import { describe, expect, it } from "vitest";
import { restrictionsOf } from "../characteristics.js";
import { activePlayerOf } from "../state.js";
import {
  A,
  B,
  C,
  attack,
  blockOffer,
  cast,
  counters,
  enter,
  keywords,
  lands,
  life,
  loyalty,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("recheck R4 group B", () => {
  it("Combat Calligrapher: the attacking player gets a tapped Inkling attacking the opponent it attacked", () => {
    const { game, a } = table({ players: 3 });
    spawn(game, "Combat Calligrapher", B);
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears], C);
    expect(tokensNamed(game, "Inkling Token", A)).toBe(1);
    expect(tokensNamed(game, "Inkling Token", B)).toBe(0);
    // Bears (2) and the Inkling that entered attacking Carol (2).
    expect(life(game, C)).toBe(16);
  });

  it("Combat Calligrapher: attacking its controller makes no Inkling", () => {
    const { game, a } = table({ players: 3 });
    spawn(game, "Combat Calligrapher", B);
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears], B);
    expect(tokensNamed(game, "Inkling Token")).toBe(0);
  });

  it("Persistent Marshstalker returns attacking only with threshold, and counts other Rats", () => {
    const { game, a } = table();
    const rat = spawn(game, "Persistent Marshstalker");
    const stalker = toGraveyard(game, "Persistent Marshstalker");
    for (let i = 0; i < 6; i++) toGraveyard(game, "Wastes");
    lands(game, "Swamp", 3);
    pickModes(a, 0);
    attack(game, a, [rat]);
    expect(zone(game, stalker)).toBe("battlefield");
    expect(game.state.objects[stalker].tapped).toBe(true);
    expect(pt(game, rat).power).toBe(4);
    expect(life(game, B)).toBe(12);
  });

  it("Persistent Marshstalker stays in the graveyard below threshold", () => {
    const { game, a } = table();
    const rat = spawn(game, "Persistent Marshstalker");
    const stalker = toGraveyard(game, "Persistent Marshstalker");
    for (let i = 0; i < 5; i++) toGraveyard(game, "Wastes");
    lands(game, "Swamp", 3);
    pickModes(a, 0);
    attack(game, a, [rat]);
    expect(zone(game, stalker)).toBe("graveyard");
  });

  it("Phoenix Chick returns tapped and attacking with a +1/+1 counter", () => {
    const { game, a } = table();
    const attackers = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    const chick = toGraveyard(game, "Phoenix Chick");
    lands(game, "Mountain", 2);
    pickModes(a, 0);
    attack(game, a, attackers);
    expect(zone(game, chick)).toBe("battlefield");
    expect(counters(game, chick)).toBe(1);
    expect(life(game, B)).toBe(20 - 6 - 2);
  });

  it("Suspended Sentence destroys, drains its controller 3, and suspends itself", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 4);
    const card = toHand(game, "Suspended Sentence");
    cast(game, card, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
    expect(zone(game, card)).toBe("exile");
    expect(counters(game, card, "time")).toBe(3);
  });

  it("Venser's −1 makes every creature unblockable, one entering later included", () => {
    const { game } = table();
    const venser = spawn(game, "Venser, the Sojourner");
    loyalty(game, venser, -1);
    const later = spawn(game, "Grizzly Bears", B);
    expect(restrictionsOf(game.state, registryOf(game), later).has("cant-be-blocked")).toBe(true);
  });

  it("Venser's +2 returns the exiled permanent at the next end step", () => {
    const { game } = table();
    const venser = spawn(game, "Venser, the Sojourner");
    const bears = spawn(game, "Grizzly Bears");
    loyalty(game, venser, 2, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    toStep(game, "end");
    settle(game);
    expect(named(game, "Grizzly Bears", A)).toHaveLength(1);
  });

  it("Impetuous Devils makes the chosen defending creature block it", () => {
    const { game, a } = table();
    const devils = spawn(game, "Impetuous Devils");
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Hill Giant", B);
    pickTargets(a, bears);
    const offer = blockOffer(game, a, [devils]);
    expect(offer.blockRequirements).toEqual([{ blocker: bears, attacker: devils }]);
  });

  it("Culvert Ambusher makes the target creature block this turn", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant");
    pickTargets(a, bears);
    enter(game, "Culvert Ambusher");
    const offer = blockOffer(game, a, [giant]);
    expect(offer.blockRequirements).toEqual([expect.objectContaining({ blocker: bears })]);
    expect(offer.blockRequirements?.[0]?.attacker).toBeUndefined();
  });

  it("Maraleaf Rider sacrifices a Food to make the target block it", () => {
    const { game, a } = table();
    const rider = spawn(game, "Maraleaf Rider");
    const food = spawn(game, "Food Token");
    const bears = spawn(game, "Grizzly Bears", B);
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: rider,
      abilityIndex: 0,
      targets: [ref(bears)],
      sacrifice: food,
    });
    settle(game);
    expect(game.state.objects[food]?.zone ?? "gone").not.toBe("battlefield");
    const offer = blockOffer(game, a, [rider]);
    expect(offer.blockRequirements).toEqual([{ blocker: bears, attacker: rider }]);
  });

  it("Tower Above pumps, grants wither and trample, and a forced-block attack trigger", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const blocker = spawn(game, "Hill Giant", B);
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Tower Above"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
    expect(keywords(game, bears).has("wither")).toBe(true);
    expect(keywords(game, bears).has("trample")).toBe(true);
    pickTargets(a, blocker);
    const offer = blockOffer(game, a, [bears]);
    expect(offer.blockRequirements).toEqual([{ blocker, attacker: bears }]);
  });

  it("Blightwing Bandit exiles the active opponent's top card on your first spell of their turn", () => {
    const { game } = table();
    spawn(game, "Blightwing Bandit");
    lands(game, "Island", 2);
    const top = toLibrary(game, "Grizzly Bears", B);
    game.advanceUntil((s) => activePlayerOf(s) === B && s.turn.step === "upkeep" && s.priority.holder === A);
    cast(game, toHand(game, "Opt"));
    expect(zone(game, top)).toBe("exile");
  });

  it("Blightwing Bandit does nothing on your own turn", () => {
    const { game } = table();
    spawn(game, "Blightwing Bandit");
    lands(game, "Island", 1);
    const top = toLibrary(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Opt"));
    expect(zone(game, top)).toBe("library");
  });
});

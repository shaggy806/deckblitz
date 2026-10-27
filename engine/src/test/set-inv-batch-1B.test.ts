/**
 * Invasion (INV; B226), group B. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import {
  A,
  B,
  activate,
  attack,
  registryOf,
  cast,
  controller,
  counters,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickTargets,
  ref,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Spinal Embrace", () => {
  it("steals and untaps a creature during combat, then sacrifices it for life equal to its toughness", () => {
    const { game } = table();
    lands(game, "Island", 5);
    lands(game, "Swamp", 1);
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    const card = toHand(game, "Spinal Embrace");
    expect(game.canDispatch({ type: "cast-spell", player: A, card, targets: [ref(bears)] })).not.toBeNull();
    toStep(game, "begin-combat");
    cast(game, card, { targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(A);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(keywords(game, bears).has("haste")).toBe(true);
    toStep(game, "cleanup");
    expect(graveyard(game, B)).toContain(bears);
    expect(life(game, A)).toBe(22);
  });
});

describe("Agonizing Demise", () => {
  it("kicked, deals the destroyed creature's power to its controller", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    lands(game, "Mountain", 2);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Agonizing Demise"), { targets: [ref(giant)], kicked: true });
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
  });

  it("unkicked, deals nothing", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Agonizing Demise"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });
});

describe("Probe", () => {
  it("kicked, the target player discards two as well", () => {
    const { game } = table();
    lands(game, "Island", 3);
    lands(game, "Swamp", 2);
    const card = toHand(game, "Probe");
    const mine = hand(game, A).length;
    const theirs = hand(game, B).length;
    cast(game, card, { targets: [ref(B)], kicked: true });
    expect(hand(game, A).length).toBe(mine - 1 + 3 - 2);
    expect(hand(game, B).length).toBe(theirs - 2);
  });
});

describe("Saproling Infestation + Dismantling Blow", () => {
  it("a kicked spell makes a Saproling, and kicked Dismantling Blow draws two", () => {
    const { game } = table();
    spawn(game, "Saproling Infestation", B);
    lands(game, "Plains", 3);
    lands(game, "Island", 3);
    const target = spawn(game, "Saproling Infestation", B);
    const card = toHand(game, "Dismantling Blow");
    const before = hand(game, A).length;
    cast(game, card, { targets: [ref(target)], kicked: true });
    expect(zone(game, target)).toBe("graveyard");
    expect(hand(game, A).length).toBe(before - 1 + 2);
    // Both Infestations saw the kick (the target triggered as the spell was cast).
    expect(tokensNamed(game, "Saproling Token", B)).toBe(2);
  });
});

describe("Urborg Skeleton", () => {
  it("kicked, enters with a +1/+1 counter", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const card = toHand(game, "Urborg Skeleton");
    cast(game, card, { kicked: true });
    expect(zone(game, card)).toBe("battlefield");
    expect(counters(game, card)).toBe(1);
  });
});

describe("Distorting Wake", () => {
  it("returns exactly X target nonland permanents", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Hill Giant", B);
    const stays = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Distorting Wake"), { x: 2, targets: [ref(one), ref(two)] });
    expect(zone(game, one)).toBe("hand");
    expect(zone(game, two)).toBe("hand");
    expect(zone(game, stays)).toBe("battlefield");
  });
});

describe("Dromar, the Banisher", () => {
  it("pays {2}{U} on combat damage and returns every creature of the chosen colour", () => {
    const { game, a } = table();
    const dromar = spawn(game, "Dromar, the Banisher");
    lands(game, "Island", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const answers = [[0], [4]]; // yes, then Green
    a.chooseModesFn = () => answers.shift() ?? [];
    attack(game, a, [dromar]);
    expect(life(game, B)).toBe(14);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, giant)).toBe("battlefield");
    expect(zone(game, dromar)).toBe("battlefield");
  });
});

describe("Blind Seer", () => {
  it("makes a permanent the chosen colour until end of turn", () => {
    const { game, a } = table();
    const seer = spawn(game, "Blind Seer");
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    a.chooseModesFn = () => [2];
    activate(game, seer, 0, { targets: [ref(bears)] });
    expect([...computeCharacteristics(game.state, registryOf(game), bears).colors]).toEqual(["B"]);
    toStep(game, "precombat-main", B);
    expect([...computeCharacteristics(game.state, registryOf(game), bears).colors]).toEqual(["G"]);
  });
});

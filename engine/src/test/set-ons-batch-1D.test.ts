import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  enter,
  graveyard,
  hand,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Onslaught batch 1D", () => {
  it("Ebonblade Reaper: its attack costs you half your life, its hit halves theirs (rounded up)", () => {
    const { game, a } = table();
    const reaper = spawn(game, "Ebonblade Reaper");
    attack(game, a, [reaper]);
    expect(life(game, A)).toBe(10);
    // 1 combat damage (19), then half of 19 rounded up.
    expect(life(game, B)).toBe(9);
  });

  it("Sparksmith deals X to the creature and X to you, X counting every Goblin", () => {
    const { game } = table();
    const smith = spawn(game, "Sparksmith");
    spawn(game, "Sparksmith", B);
    spawn(game, "Sparksmith", B);
    const bruiser = spawn(game, "Shaleskin Bruiser", B);
    activate(game, smith, 0, { targets: [ref(bruiser)] });
    expect(game.state.objects[bruiser].damageMarked).toBe(3);
    expect(life(game, A)).toBe(17);
  });

  it("Chain of Acid: the destroyed permanent's controller may copy it at a new target", () => {
    const { game, a, b } = table();
    const mine = spawn(game, "Righteous Cause");
    const theirs = spawn(game, "Righteous Cause", B);
    lands(game, "Forest", 4);
    pickModes(b, 0);
    pickModes(a);
    pickTargets(b, mine);
    cast(game, toHand(game, "Chain of Acid"), { targets: [ref(theirs)] });
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, mine)).toBe("graveyard");
  });

  it("Gigapede: at your upkeep in the graveyard, discard a card to return it to hand", () => {
    const { game, a } = table();
    const pede = toGraveyard(game, "Gigapede");
    pickModes(a, 0);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, pede)).toBe("hand");
    expect(graveyard(game)).toHaveLength(1);
    expect(hand(game)).toContain(pede);
  });

  it("Aether Charge: a Beast entering under you may deal 4 damage to target opponent", () => {
    const { game, a } = table();
    spawn(game, "Aether Charge");
    pickTargets(a, B);
    pickModes(a, 0);
    enter(game, "Shaleskin Bruiser");
    expect(life(game, B)).toBe(16);
  });

  it("Annex: you control the enchanted land", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const land = spawn(game, "Forest", B);
    cast(game, toHand(game, "Annex"), { targets: [ref(land)] });
    expect(controller(game, land)).toBe(A);
  });

  it("Battlefield Medic prevents X damage, X the Clerics on the battlefield", () => {
    const { game } = table();
    const medic = spawn(game, "Battlefield Medic");
    spawn(game, "Nova Cleric", B);
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, medic, 0, { targets: [ref(bears)] });
    game.debugApplyEffect(A, { kind: "damage", amount: 3, target: 0 }, [ref(bears)]);
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].damageMarked).toBe(1);
  });

  it("Shaleskin Bruiser gets +3/+0 for each other attacking Beast", () => {
    const { game, a } = table();
    const one = spawn(game, "Shaleskin Bruiser");
    const two = spawn(game, "Shaleskin Bruiser");
    a.declareAttackersFn = () => [one, two].map((attacker) => ({ attacker, defender: B }));
    toStep(game, "declare-blockers");
    expect(pt(game, one).power).toBe(7);
  });
});

import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  enter,
  graveyard,
  hand,
  lands,
  life,
  nextTurn,
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

describe("Mirage batch 1, group C", () => {
  it("Asmira counts creatures put into your graveyard, not an opponent's", () => {
    const { game } = table();
    const asmira = spawn(game, "Asmira, Holy Avenger", A);
    const mine = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(mine)]);
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [ref(theirs)]);
    settle(game);
    toStep(game, "end");
    settle(game);
    expect(counters(game, asmira)).toBe(1);
  });

  it("Wall of Resistance gets one +0/+1 counter after being dealt damage", () => {
    const { game } = table();
    const wall = spawn(game, "Wall of Resistance", A);
    const quiet = spawn(game, "Wall of Resistance", A);
    // A real source deals the damage (the ruling's "dealt damage" reads the damage history).
    const hunter = spawn(game, "Abyssal Hunter", A);
    lands(game, "Swamp", 1);
    activate(game, hunter, 0, { targets: [ref(wall)] });
    expect(game.state.objects[wall].damageMarked).toBe(1);
    toStep(game, "end");
    settle(game);
    expect(counters(game, wall, "+0/+1")).toBe(1);
    expect(pt(game, wall).toughness).toBe(4);
    expect(counters(game, quiet, "+0/+1")).toBe(0);
  });

  it("Telim'Tor's Edict exiles only a permanent you own or control, and draws next upkeep", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1);
    const edict = toHand(game, "Telim'Tor's Edict");
    expect(() => cast(game, edict, { targets: [ref(theirs)] })).toThrow();
    cast(game, edict, { targets: [ref(mine)] });
    expect(zone(game, mine)).toBe("exile");
    const before = hand(game, A).length;
    nextTurn(game);
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("Bone Harvest stacks the chosen creature cards on top of the library", () => {
    const { game, a } = table();
    const first = toGraveyard(game, "Grizzly Bears", A);
    const second = toGraveyard(game, "Hill Giant", A);
    lands(game, "Swamp", 3);
    pickTargets(a, first, second);
    cast(game, toHand(game, "Bone Harvest"), { targets: [ref(first), ref(second)] });
    expect(zone(game, first)).toBe("library");
    expect(zone(game, second)).toBe("library");
    expect(graveyard(game, A)).not.toContain(first);
    const before = hand(game, A).length;
    nextTurn(game);
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("Ashen Powder offers only creature cards in an opponent's graveyard", () => {
    const { game } = table();
    const theirs = toGraveyard(game, "Grizzly Bears", B);
    const mine = toGraveyard(game, "Grizzly Bears", A);
    lands(game, "Swamp", 4);
    const powder = toHand(game, "Ashen Powder");
    expect(() => cast(game, powder, { targets: [ref(mine)] })).toThrow();
    cast(game, powder, { targets: [ref(theirs)] });
    expect(zone(game, theirs)).toBe("battlefield");
    expect(controller(game, theirs)).toBe(A);
  });

  it("Goblin Soothsayer pumps red creatures, sacrificing a Goblin", () => {
    const { game } = table();
    const sayer = spawn(game, "Goblin Soothsayer", A);
    const fodder = spawn(game, "Goblin Soothsayer", A);
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 1);
    game.dispatch({ type: "activate-ability", player: A, source: sayer, abilityIndex: 0, targets: [], sacrifice: fodder });
    settle(game);
    expect(zone(game, fodder)).toBe("graveyard");
    expect(pt(game, sayer)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, giant)).toEqual({ power: 4, toughness: 4 });
  });

  it("Wellspring steals the enchanted land until end of turn", () => {
    const { game, a } = table();
    const land = spawn(game, "Forest", B);
    lands(game, "Plains", 2);
    lands(game, "Forest", 1);
    pickTargets(a, land);
    cast(game, toHand(game, "Wellspring"), { targets: [ref(land)] });
    expect(controller(game, land)).toBe(A);
    nextTurn(game);
    expect(controller(game, land)).toBe(B);
  });

  it("Zebra Unicorn gains life equal to the damage it deals", () => {
    const { game, a } = table();
    const unicorn = spawn(game, "Zebra Unicorn", A);
    attack(game, a, [unicorn]);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
  });

  it("Abyssal Hunter taps the target and deals its power to it", () => {
    const { game } = table();
    const hunter = enter(game, "Abyssal Hunter", A);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 1);
    activate(game, hunter, 0, { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.objects[bears].damageMarked).toBe(1);
  });
});

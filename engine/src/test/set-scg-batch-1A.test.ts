/**
 * Scourge (SCG; B216), group A. One test per card whose behaviour is more
 * than a stat line or an exact copy of an already-tested pattern, on the
 * clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  cast,
  destroy,
  graveyard,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  pt,
  quiet,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
  enter,
} from "./harness.js";

describe("SCG group A", () => {
  it("Decree of Justice: cast for X=1 makes one Angel; cycled, paying X=2 makes two Soldiers", () => {
    const { game } = table();
    lands(game, "Plains", 11);
    cast(game, toHand(game, "Decree of Justice"), { x: 1 });
    expect(tokensNamed(game, "4/4 Angel Token", A)).toBe(1);
    game.dispatch({ type: "cycle", player: A, card: toHand(game, "Decree of Justice") });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-modes");
    game.dispatch({ type: "choose-modes", player: A, modes: [0], xValue: 2 });
    settle(game);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(2);
  });

  it("Xantid Swarm: the player it attacks can't cast spells this turn (a Bear attacking leaves them free)", () => {
    for (const attacker of ["Xantid Swarm", "Grizzly Bears"]) {
      const { game, a } = table();
      const swarm = spawn(game, attacker);
      lands(game, "Forest", 1, B);
      const bears = spawn(game, "Grizzly Bears", B);
      const growth = toHand(game, "Giant Growth", B);
      a.declareAttackersFn = () => [{ attacker: swarm, defender: B }];
      game.advanceUntil(
        (s) => s.turn.step === "declare-attackers" && s.priority.holder === B && s.zones.shared.stack.length === 0,
      );
      const why = game.canDispatch({ type: "cast-spell", player: B, card: growth, targets: [ref(bears)] });
      if (attacker === "Xantid Swarm") expect(why).not.toBeNull();
      else expect(why).toBeNull();
    }
  });

  it("Dispersal Shield: counters a spell no greater than your greatest mana value, not a greater one", () => {
    const { game } = table();
    lands(game, "Island", 10);
    spawn(game, "Grizzly Bears");
    const hand = game.state.zones.perPlayer[A].hand;
    const div = toHand(game, "Divination");
    const before = hand.length;
    cast(game, div, { settle: false });
    cast(game, toHand(game, "Dispersal Shield"), { targets: [ref(div)] });
    // Grizzly Bears (2) < Divination (3): it resolves and draws two.
    expect(game.state.zones.perPlayer[A].hand.length).toBe(before + 1);
    spawn(game, "Hill Giant");
    const div2 = toHand(game, "Divination");
    const before2 = game.state.zones.perPlayer[A].hand.length;
    cast(game, div2, { settle: false });
    cast(game, toHand(game, "Dispersal Shield"), { targets: [ref(div2)] });
    // Hill Giant (4) >= Divination (3): countered, no draw.
    expect(game.state.zones.perPlayer[A].hand.length).toBe(before2 - 1);
    expect(graveyard(game, A)).toContain(div2);
  });

  it("Faces of the Past: a Bear dies, tap all untapped creatures sharing a type with it", () => {
    const { game, a } = table();
    spawn(game, "Faces of the Past");
    const dying = spawn(game, "Grizzly Bears", B);
    const bear = spawn(game, "Grizzly Bears", A);
    const goblin = spawn(game, "Raging Goblin", A);
    pickModes(a, 0);
    destroy(game, dying);
    expect(game.state.objects[bear].tapped).toBe(true);
    expect(game.state.objects[goblin].tapped).toBe(false);
  });

  it("Faces of the Past: or untap all tapped ones", () => {
    const { game, a } = table();
    spawn(game, "Faces of the Past");
    const dying = spawn(game, "Grizzly Bears", B);
    const bear = spawn(game, "Grizzly Bears", A, { tapped: true });
    const goblin = spawn(game, "Raging Goblin", A, { tapped: true });
    pickModes(a, 1);
    destroy(game, dying);
    expect(game.state.objects[bear].tapped).toBe(false);
    expect(game.state.objects[goblin].tapped).toBe(true);
  });

  it("Nefashu: up to five target creatures each get -1/-1", () => {
    const { game, a } = table();
    const nefashu = spawn(game, "Nefashu");
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Hill Giant", B);
    pickTargets(a, one, two);
    a.declareAttackersFn = () => [{ attacker: nefashu, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && quiet(s) && s.priority.holder === A);
    expect(pt(game, one)).toEqual({ power: 1, toughness: 1 });
    expect(pt(game, two)).toEqual({ power: 2, toughness: 2 });
  });

  it("Reward the Faithful: each target player gains the greatest mana value among your permanents", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    spawn(game, "Hill Giant");
    spawn(game, "Hill Giant", B);
    spawn(game, "Craw Wurm", B);
    cast(game, toHand(game, "Reward the Faithful"), { targets: [ref(A), ref(B)] });
    expect(life(game, A)).toBe(24);
    expect(life(game, B)).toBe(24);
  });

  it("Torrent of Fire: damage equal to the greatest mana value among your permanents", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    spawn(game, "Hill Giant");
    cast(game, toHand(game, "Torrent of Fire"), { targets: [ref(B)] });
    // Mountains are mana value 0, Hill Giant 4.
    expect(life(game, B)).toBe(16);
  });

  it("Dragon Scales: returns from the graveyard attached to an opponent's entering 6-drop", () => {
    const { game, a } = table();
    const scales = toGraveyard(game, "Dragon Scales");
    pickModes(a, 0);
    enter(game, "Hill Giant", B);
    expect(zone(game, scales)).toBe("graveyard");
    const wurm = enter(game, "Craw Wurm", B);
    expect(zone(game, scales)).toBe("battlefield");
    expect(game.state.objects[scales].attachedTo).toBe(wurm);
    expect(pt(game, wurm)).toEqual({ power: 7, toughness: 6 });
  });

  it("Daru Spiritualist: a Cleric you control targeted gets +0/+2", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const daru = spawn(game, "Daru Spiritualist");
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(daru)] });
    expect(pt(game, daru)).toEqual({ power: 4, toughness: 6 });
  });

  it("Frozen Solid: the enchanted creature is destroyed when dealt damage", () => {
    const { game } = table();
    lands(game, "Island", 3);
    lands(game, "Mountain", 1);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Frozen Solid"), { targets: [ref(giant)] });
    cast(game, toHand(game, "Shock"), { targets: [ref(giant)] });
    expect(named(game, "Hill Giant", B)).toHaveLength(0);
  });
});

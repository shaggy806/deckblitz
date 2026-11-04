/**
 * Triggers on a spell being countered (rule 701.6a), seen from what countered
 * it (`counters-spell`: Baral, Lullmage Mentor) or from who cast it
 * (`spell-countered`: Multani's Presence).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, activate, B, cast, graveyard, hand, lands, pickModes, pickTargets, ref, settle, spawn, table, tokensNamed, toHand, zone } from "./harness.js";

/** Alice's Grizzly Bears on the stack. */
function bears(game: Game): ObjectId {
  lands(game, "Forest", 2);
  const spell = toHand(game, "Grizzly Bears");
  cast(game, spell, { settle: false, targets: [] });
  return spell;
}

const counterBy = (game: Game, by: PlayerId, spell: ObjectId): void => {
  game.debugApplyEffect(by, { kind: "counter", target: 0 }, [ref(spell)]);
  settle(game);
};

describe("counters-spell", () => {
  it("Baral: Alice's counterspell loots her", () => {
    const { game, a } = table();
    pickModes(a, 0);
    spawn(game, "Baral, Chief of Compliance");
    const spell = bears(game);
    lands(game, "Island", 2);
    const counter = toHand(game, "Counterspell");
    const before = hand(game).length;
    cast(game, counter, { targets: [ref(spell)] });
    expect(zone(game, spell)).toBe("graveyard");
    // Counterspell left, a card drawn, a card discarded.
    expect(hand(game).length).toBe(before - 1);
    expect(hand(game)).not.toContain(counter);
    expect(graveyard(game).length).toBe(3);
  });

  it("Baral: she may decline", () => {
    const { game, a } = table();
    pickModes(a);
    spawn(game, "Baral, Chief of Compliance");
    const spell = bears(game);
    const before = hand(game).length;
    counterBy(game, A, spell);
    expect(hand(game).length).toBe(before);
  });

  it("Baral: not when an opponent's effect counters the spell", () => {
    const { game, a } = table();
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    spawn(game, "Baral, Chief of Compliance");
    counterBy(game, B, bears(game));
    expect(asked).toBe(0);
  });

  it("Baral: not for countering an ability (Stifle)", () => {
    const { game, a } = table();
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    spawn(game, "Baral, Chief of Compliance");
    lands(game, "Wastes", 3);
    const rod = spawn(game, "Rod of Ruin");
    activate(game, rod, 0, { targets: [ref(B)], settle: false });
    counterBy(game, A, game.state.zones.shared.stack[0]);
    expect(game.state.players[B].life).toBe(20);
    expect(asked).toBe(0);
  });

  it("Baral: not for a spell that can't be countered", () => {
    const { game, a } = table();
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    spawn(game, "Baral, Chief of Compliance");
    lands(game, "Bayou", 2);
    const victim = spawn(game, "Grizzly Bears", B);
    const decay = toHand(game, "Abrupt Decay");
    cast(game, decay, { targets: [ref(victim)], settle: false });
    counterBy(game, A, decay);
    expect(asked).toBe(0);
  });

  it("Baral: not for a spell that fizzles, which isn't countered", () => {
    const { game, a } = table();
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    spawn(game, "Baral, Chief of Compliance");
    lands(game, "Mountain", 2);
    const victim = spawn(game, "Grizzly Bears", B);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(victim)], settle: false });
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [ref(victim)]);
    settle(game);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(asked).toBe(0);
  });

  it("Baral: ward's counter is an ability its controller controls", () => {
    const { game, b } = table();
    pickModes(b, 0);
    spawn(game, "Baral, Chief of Compliance", B);
    const miirym = spawn(game, "Miirym, Sentinel Wyrm", B);
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    const before = hand(game, B).length;
    toHand(game, "Wastes", B);
    cast(game, bolt, { targets: [ref(miirym)] });
    expect(zone(game, bolt)).toBe("graveyard");
    // Drew one and discarded one, the Wastes added above still counted.
    expect(hand(game, B).length).toBe(before + 1);
    expect(graveyard(game, B).length).toBe(1);
  });

  it("Baral: instants and sorceries cost {1} less, not their colored mana", () => {
    const { game } = table();
    spawn(game, "Baral, Chief of Compliance");
    const spell = bears(game);
    lands(game, "Island", 2);
    const cancel = toHand(game, "Cancel");
    cast(game, cancel, { targets: [ref(spell)], settle: false });
    expect(zone(game, cancel)).toBe("stack");
  });

  it("Lullmage Mentor: a Merfolk for each spell countered, and seven Merfolk counter a spell", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const mentor = spawn(game, "Lullmage Mentor");
    for (let i = 0; i < 6; i += 1) spawn(game, "Merfolk Token");
    const spell = bears(game);
    activate(game, mentor, 0, { targets: [ref(spell)] });
    expect(zone(game, spell)).toBe("graveyard");
    expect(game.state.objects[mentor].tapped).toBe(true);
    // The trigger's token: the six spawned to pay aren't tokens to this count.
    expect(tokensNamed(game, "Merfolk Token", A)).toBe(1);
  });
});

describe("spell-countered", () => {
  it("Multani's Presence: draws when Alice's spell is countered, by anyone", () => {
    const { game } = table();
    spawn(game, "Multani's Presence");
    const before = hand(game).length;
    counterBy(game, B, bears(game));
    expect(hand(game).length).toBe(before + 1);
  });

  it("Multani's Presence: not for an opponent's spell", () => {
    const { game } = table();
    spawn(game, "Multani's Presence", B);
    const before = hand(game, B).length;
    counterBy(game, A, bears(game));
    expect(hand(game, B).length).toBe(before);
  });

  it("Multani's Presence: not for a copy, which wasn't cast (rule 707.10)", () => {
    const { game, a } = table();
    pickTargets(a, B);
    pickModes(a);
    spawn(game, "Multani's Presence");
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    game.debugApplyEffect(A, { kind: "copy-spell", target: 0 }, [ref(bolt)]);
    const copy = game.state.zones.shared.stack.find((id) => id !== bolt);
    expect(copy).toBeDefined();
    const before = hand(game).length;
    game.debugApplyEffect(B, { kind: "counter", target: 0 }, [ref(copy as ObjectId)]);
    settle(game);
    expect(hand(game).length).toBe(before);
    expect(game.state.players[B].life).toBe(17);
  });
});

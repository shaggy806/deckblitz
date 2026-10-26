/**
 * Abilities that work while their card is suspended (rule 702.62b — in exile,
 * with suspend and a time counter; rule 113.6b): `TriggeredAbility.whileSuspended`
 * and `ActivatedAbility.zone: "suspended"`.
 */
import { describe, expect, it } from "vitest";

import { A, B, lands, settle, spawn, table, toHand, tokensNamed } from "./harness.js";

const time = (game: ReturnType<typeof table>["game"], id: string): number =>
  game.state.objects[id as never].counters.time ?? 0;

describe("abilities that work while suspended", () => {
  it("Greater Gargadon: a sacrifice takes a time counter off, only while it's suspended", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const gargadon = toHand(game, "Greater Gargadon");
    const bear = spawn(game, "Grizzly Bears");
    const land = spawn(game, "Forest");
    // Not suspended yet: no ability to offer from the hand.
    expect(game.legalActions(A).some((a) => a.kind === "activate-ability" && a.source === gargadon)).toBe(false);
    game.dispatch({ type: "suspend", player: A, card: gargadon });
    expect(time(game, gargadon)).toBe(10);
    expect(game.legalActions(A).some((a) => a.kind === "activate-ability" && a.source === gargadon)).toBe(true);
    // Bob can't activate it: it's alice's.
    expect(game.canDispatch({ type: "activate-ability", player: B, source: gargadon, abilityIndex: 0, targets: [], sacrifice: bear } as never)).not.toBeNull();
    game.dispatch({ type: "activate-ability", player: A, source: gargadon, abilityIndex: 0, targets: [], sacrifice: bear });
    settle(game);
    expect(game.state.objects[bear].zone).toBe("graveyard");
    expect(time(game, gargadon)).toBe(9);
    game.dispatch({ type: "activate-ability", player: A, source: gargadon, abilityIndex: 0, targets: [], sacrifice: land });
    settle(game);
    expect(time(game, gargadon)).toBe(8);
  });

  it("Greater Gargadon's last counter off its own ability offers the free cast", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const gargadon = toHand(game, "Greater Gargadon");
    game.dispatch({ type: "suspend", player: A, card: gargadon });
    game.state.objects[gargadon].counters.time = 1;
    const bear = spawn(game, "Grizzly Bears");
    a.chooseCastNowFn = (_view, offer) =>
      offer.casts.some((c) => c.card === gargadon)
        ? { type: "cast-spell", player: A, card: gargadon, targets: [], via: "effect", free: true }
        : null;
    game.dispatch({ type: "activate-ability", player: A, source: gargadon, abilityIndex: 0, targets: [], sacrifice: bear });
    settle(game);
    expect(game.state.objects[gargadon].zone).toBe("battlefield");
  });

  it("Deep-Sea Kraken: an opponent's spell takes a counter off; its owner's own doesn't", () => {
    const { game } = table();
    lands(game, "Island", 3);
    lands(game, "Mountain", 2, B);
    const kraken = toHand(game, "Deep-Sea Kraken");
    game.dispatch({ type: "suspend", player: A, card: kraken });
    expect(time(game, kraken)).toBe(9);
    // Alice's own spell: nothing.
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    game.dispatch({ type: "cast-spell", player: A, card: bolt, targets: [{ kind: "player", player: B }] });
    settle(game);
    expect(time(game, kraken)).toBe(9);
    // Bob's: one off.
    const shock = toHand(game, "Shock", B);
    game.dispatch({ type: "pass-priority", player: A });
    game.advanceUntil((s) => s.priority.holder === B || s.turn.number > 1);
    game.dispatch({ type: "cast-spell", player: B, card: shock, targets: [{ kind: "player", player: A }] });
    settle(game);
    expect(time(game, kraken)).toBe(8);
  });

  it("a battlefield Deep-Sea Kraken has no such trigger", () => {
    const { game } = table();
    spawn(game, "Deep-Sea Kraken");
    lands(game, "Mountain", 1, B);
    const shock = toHand(game, "Shock", B);
    game.dispatch({ type: "pass-priority", player: A });
    game.advanceUntil((s) => s.priority.holder === B || s.turn.number > 1);
    game.dispatch({ type: "cast-spell", player: B, card: shock, targets: [{ kind: "player", player: A }] });
    expect(game.state.pendingTriggers.length + game.state.zones.shared.stack.length).toBe(1);
  });

  it("Dinosaurs on a Spaceship: a token per counter removed in exile, the last one included", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    lands(game, "Plains", 1);
    const dinos = toHand(game, "Dinosaurs on a Spaceship");
    game.dispatch({ type: "suspend", player: A, card: dinos });
    game.state.objects[dinos].counters.time = 2;
    a.chooseCastNowFn = () => null;
    // Alice's next upkeep: one off, one token.
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "draw");
    expect(time(game, dinos)).toBe(1);
    expect(tokensNamed(game, "2/2 Red and White Dinosaur Token (Flying, Haste)", A)).toBe(1);
    game.advanceUntil((s) => s.turn.number === 5 && s.turn.step === "draw");
    expect(tokensNamed(game, "2/2 Red and White Dinosaur Token (Flying, Haste)", A)).toBe(2);
    // Declined, it's no longer suspended.
    expect(game.state.objects[dinos].suspended).toBe(false);
  });

  it("Riftmarked Knight: only the last counter coming off makes the Knight", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    const knight = toHand(game, "Riftmarked Knight");
    game.dispatch({ type: "suspend", player: A, card: knight });
    game.state.objects[knight].counters.time = 2;
    a.chooseCastNowFn = () => null;
    const token = "2/2 Black Knight Token (Flanking, Protection from White, Haste)";
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "draw");
    expect(tokensNamed(game, token, A)).toBe(0);
    game.advanceUntil((s) => s.turn.number === 5 && s.turn.step === "draw");
    expect(tokensNamed(game, token, A)).toBe(1);
  });

  it("Nihilith: a card going to an opponent's graveyard may take a counter off", () => {
    const { game, a } = table();
    a.chooseModesFn = () => [0];
    lands(game, "Swamp", 2);
    const nihilith = toHand(game, "Nihilith");
    game.dispatch({ type: "suspend", player: A, card: nihilith });
    expect(time(game, nihilith)).toBe(7);
    const bear = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    game.dispatch({ type: "cast-spell", player: A, card: bolt, targets: [{ kind: "object", object: bear }] });
    settle(game);
    // The Bear went to bob's graveyard (the Bolt to alice's: no trigger).
    expect(time(game, nihilith)).toBe(6);
  });
});

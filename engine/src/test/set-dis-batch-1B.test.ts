/**
 * Dissension, group B. One test per card whose behaviour is more than a stat
 * line or an already-tested pattern.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  enter,
  hand,
  lands,
  life,
  pickModes,
  ref,
  settle,
  spawn,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
  table,
} from "./harness.js";

describe("Dissension, group B", () => {
  it("Dovescape counters a noncreature spell and gives its caster Birds equal to its mana value", () => {
    const { game } = table();
    spawn(game, "Dovescape", B);
    lands(game, "Island", 3);
    const divination = toHand(game, "Divination");
    const before = hand(game).length;
    cast(game, divination);
    expect(zone(game, divination)).toBe("graveyard");
    expect(hand(game).length).toBe(before - 1);
    expect(tokensNamed(game, "Bird Token (White-Blue)", A)).toBe(3);
    expect(tokensNamed(game, "Bird Token (White-Blue)", B)).toBe(0);
  });

  it("Dovescape lets a creature spell through", () => {
    const { game } = table();
    spawn(game, "Dovescape", B);
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(tokensNamed(game, "Bird Token (White-Blue)")).toBe(0);
  });

  it("Vigean Graftmage untaps only a creature with a +1/+1 counter", () => {
    const { game } = table();
    const mage = enter(game, "Vigean Graftmage");
    expect(counters(game, mage)).toBe(2);
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    lands(game, "Island", 4);
    expect(() => activate(game, mage, 0, { targets: [ref(bears)] })).toThrow();
    game.state.objects[mage].tapped = true;
    activate(game, mage, 0, { targets: [ref(mage)] });
    expect(game.state.objects[mage].tapped).toBe(false);
  });

  it("Lyzolda deals 2 for a red creature and draws for a black one", () => {
    const { game } = table();
    const lyzolda = spawn(game, "Lyzolda, the Blood Witch");
    const goblin = spawn(game, "Raging Goblin");
    const zombie = spawn(game, "Walking Corpse");
    lands(game, "Wastes", 4);
    const before = hand(game).length;
    game.dispatch({ type: "activate-ability", player: A, source: lyzolda, abilityIndex: 0, targets: [ref(B)], sacrifice: goblin });
    settle(game);
    expect(zone(game, goblin)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
    expect(hand(game).length).toBe(before);
    game.dispatch({ type: "activate-ability", player: A, source: lyzolda, abilityIndex: 0, targets: [ref(B)], sacrifice: zombie });
    settle(game);
    expect(life(game, B)).toBe(18);
    expect(hand(game).length).toBe(before + 1);
  });

  it("Overrule counters a spell whose controller can't pay {X}, and gains X life", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const divination = toHand(game, "Divination");
    cast(game, divination, { settle: false });
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    lands(game, "Wastes", 2);
    const before = hand(game).length;
    cast(game, toHand(game, "Overrule"), { targets: [ref(divination)], x: 2 });
    expect(zone(game, divination)).toBe("graveyard");
    expect(hand(game).length).toBe(before);
    expect(life(game, A)).toBe(22);
  });

  it("Patagia Viper is sacrificed unless {U} was spent to cast it", () => {
    const { game } = table();
    const put = enter(game, "Patagia Viper");
    expect(zone(game, put)).toBe("graveyard");
    expect(tokensNamed(game, "Snake Token (Patagia Viper)", A)).toBe(2);

    lands(game, "Forest", 3);
    lands(game, "Island", 1);
    const viper = toHand(game, "Patagia Viper");
    cast(game, viper);
    expect(zone(game, viper)).toBe("battlefield");
    expect(tokensNamed(game, "Snake Token (Patagia Viper)", A)).toBe(4);
  });

  it("Azorius Aethermage draws when a permanent you own returns to your hand, not an opponent's", () => {
    const { game, a } = table();
    spawn(game, "Azorius Aethermage");
    lands(game, "Wastes", 2);
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    const before = hand(game).length;
    game.debugApplyEffect(B, { kind: "return-to-hand", target: 0 }, [ref(theirs)]);
    settle(game);
    expect(hand(game).length).toBe(before);
    game.debugApplyEffect(B, { kind: "return-to-hand", target: 0 }, [ref(bears)]);
    settle(game);
    // The Bears and the drawn card.
    expect(hand(game).length).toBe(before + 2);
  });

  it("Sandstorm Eidolon returns from the graveyard when you cast a multicolored spell", () => {
    const { game, a } = table();
    const eidolon = toGraveyard(game, "Sandstorm Eidolon");
    lands(game, "Forest", 2);
    pickModes(a, 0);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(zone(game, eidolon)).toBe("graveyard");
    lands(game, "Island", 1);
    lands(game, "Plains", 1);
    lands(game, "Wastes", 1);
    cast(game, toHand(game, "Azorius Aethermage"));
    expect(zone(game, eidolon)).toBe("hand");
  });

  it("Twinstrike deals 2 to each, or destroys both when hellbent", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    const ogre = spawn(game, "Hill Giant", B);
    lands(game, "Wastes", 3);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    toHand(game, "Wastes");
    cast(game, toHand(game, "Twinstrike"), { targets: [ref(giant), ref(ogre)] });
    expect(game.state.objects[giant].damageMarked).toBe(2);
    expect(game.state.objects[ogre].damageMarked).toBe(2);

    const giant2 = spawn(game, "Hill Giant", B);
    const ogre2 = spawn(game, "Gray Ogre", B);
    lands(game, "Wastes", 3);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    game.debugApplyEffect(A, { kind: "discard-hand", who: "you" }, []);
    settle(game);
    cast(game, toHand(game, "Twinstrike"), { targets: [ref(giant2), ref(ogre2)] });
    expect(zone(game, giant2)).toBe("graveyard");
    expect(zone(game, ogre2)).toBe("graveyard");
  });

  it("Leafdrake Roost's land makes a Drake", () => {
    const { game } = table();
    const land = spawn(game, "Wastes");
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    lands(game, "Wastes", 3);
    cast(game, toHand(game, "Leafdrake Roost"), { targets: [ref(land)] });
    game.state.objects[land].tapped = false;
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    activate(game, land, 1);
    expect(tokensNamed(game, "Drake Token (Leafdrake Roost)", A)).toBe(1);
  });
});
